require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);

// ========= CORS =========
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// ========= DB (mantido) =========
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// ========= GitHub config =========
const GH_OWNER = process.env.GITHUB_OWNER;
const GH_REPO = process.env.GITHUB_REPO;
const GH_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GH_DATA_PATH = process.env.GITHUB_DATA_PATH || 'data/state.json';
const GH_TOKEN = process.env.GITHUB_TOKEN || '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';

// Helpers base64 UTF-8
function toBase64Utf8(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}
function fromBase64Utf8(b64) {
  return Buffer.from(b64, 'base64').toString('utf8');
}

function assertGithubConfigured() {
  if (!GH_OWNER || !GH_REPO || !GH_TOKEN) {
    const missing = [
      !GH_OWNER ? 'GITHUB_OWNER' : null,
      !GH_REPO ? 'GITHUB_REPO' : null,
      !GH_TOKEN ? 'GITHUB_TOKEN' : null
    ].filter(Boolean);
    throw new Error(`Config GitHub incompleta. Faltando: ${missing.join(', ')}`);
  }
}

function ghHeaders() {
  return {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${GH_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

async function ghGetFile() {
  assertGithubConfigured();

  const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_DATA_PATH}?ref=${encodeURIComponent(GH_BRANCH)}&t=${Date.now()}`;

  const res = await fetch(url, { headers: ghHeaders() });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`GitHub GET falhou: ${res.status} - ${text}`);
  }

  const json = JSON.parse(text);
  const sha = json.sha;
  const contentB64 = (json.content || '').replace(/\n/g, '');
  const content = fromBase64Utf8(contentB64);
  const state = JSON.parse(content);

  // garantias
  if (!state.players) state.players = [];
  if (!state.picks) state.picks = {};
  if (!state.results) state.results = {};

  return { state, sha };
}

async function ghPutFile(state, sha, message = 'update state') {
  assertGithubConfigured();

  const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_DATA_PATH}`;

  const body = {
    message,
    content: toBase64Utf8(JSON.stringify(state, null, 2)),
    sha,
    branch: GH_BRANCH
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GitHub PUT falhou: ${res.status} - ${text}`);
  }

  const json = JSON.parse(text);
  return json.content?.sha;
}

function genId() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

// ========= Routes =========
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend está funcionando!' });
});

// ✅ 1) Ler state.json via backend (sem token no front)
app.get('/api/state', async (req, res) => {
  try {
    const { state } = await ghGetFile();
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

// ✅ 2) Cadastrar via backend (frontend manda dados; backend salva no GitHub)
app.post('/api/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body || {};

    // validações mínimas
    if (!name || String(name).trim().length < 3) {
      return res.status(400).json({ error: 'Nome inválido (mínimo 3 caracteres).' });
    }
    const u = String(username || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!u || u.length < 3) {
      return res.status(400).json({ error: 'Usuário inválido (mínimo 3 caracteres).' });
    }
    if (!/^[a-z0-9._]+$/.test(u)) {
      return res.status(400).json({ error: 'Usuário só pode ter letras, números, ponto e underline.' });
    }
    const em = String(email || '').trim().toLowerCase();
    if (!em || !em.includes('@')) {
      return res.status(400).json({ error: 'E-mail inválido.' });
    }
    const pass = String(password || '');
    if (pass.length < 4) {
      return res.status(400).json({ error: 'Senha inválida (mínimo 4 caracteres).' });
    }

    // pega estado atual + sha
    const { state, sha } = await ghGetFile();

    // duplicatas
    const usernameExists = state.players.some(p => (p.username || '').toLowerCase() === u);
    if (usernameExists) return res.status(409).json({ error: 'Esse usuário já está em uso.' });

    const emailExists = state.players.some(p => (p.email || '').toLowerCase() === em);
    if (emailExists) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });

    const newPlayer = {
      id: genId(),
      name: String(name).trim(),
      username: u,
      email: em,
      password: pass,
      bonusPicks: {},
      topScorer: '',
      registeredAt: new Date().toISOString(),
      paymentPending: true
    };

    state.players.push(newPlayer);

    // salva no GitHub
    await ghPutFile(state, sha, 'cadastro: novo participante');

    // devolve sucesso (sem senha)
    res.json({
      ok: true,
      player: { id: newPlayer.id, name: newPlayer.name, username: newPlayer.username, email: newPlayer.email }
    });

  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

// ========= Socket.IO (mantido) =========
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Atualizar ranking em tempo real a cada 5 segundos (mantido)
setInterval(async () => {
  try {
    const result = await pool.query(`
      SELECT id, email, nome, pontos_totais, posicao, cravadas, resultados
      FROM ranking
      ORDER BY posicao ASC
      LIMIT 10
    `);
    io.emit('ranking-atualizado', result.rows);
  } catch (error) {
    console.error('Erro ao atualizar ranking:', error);
  }
}, 5000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
