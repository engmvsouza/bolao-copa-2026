require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend está funcionando!' });
});

// Socket.IO para atualizações em tempo real do ranking
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Atualizar ranking em tempo real a cada 5 segundos
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
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});