-- Criar tabela de usuários
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'ativo',
  pontos INT DEFAULT 0,
  posicao INT,
  cravadas INT DEFAULT 0,
  resultados INT DEFAULT 0
);

-- Criar tabela de convites
CREATE TABLE convites (
  id SERIAL PRIMARY KEY,
  codigo_convite VARCHAR(50) UNIQUE NOT NULL,
  criado_por INT REFERENCES usuarios(id),
  usado_por INT REFERENCES usuarios(id),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_uso TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pendente'
);

-- Criar tabela de jogos
CREATE TABLE jogos (
  id SERIAL PRIMARY KEY,
  time_a VARCHAR(100) NOT NULL,
  time_b VARCHAR(100) NOT NULL,
  data_jogo TIMESTAMP NOT NULL,
  fase VARCHAR(50) NOT NULL,
  placar_a INT,
  placar_b INT,
  status VARCHAR(50) DEFAULT 'pendente',
  bloqueio_palpites TIMESTAMP
);

-- Criar tabela de palpites
CREATE TABLE palpites (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  jogo_id INT REFERENCES jogos(id),
  placar_a INT NOT NULL,
  placar_b INT NOT NULL,
  data_palpite TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pontos INT DEFAULT 0,
  tipo_acerto VARCHAR(50),
  UNIQUE(usuario_id, jogo_id)
);

-- Criar tabela de apostas extras
CREATE TABLE apostas_extras (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  tipo VARCHAR(50) NOT NULL,
  palpite VARCHAR(100) NOT NULL,
  data_aposta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acertou BOOLEAN DEFAULT FALSE,
  pontos INT DEFAULT 0
);

-- Criar tabela de participação
CREATE TABLE participacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pagamento_confirmado BOOLEAN DEFAULT FALSE,
  data_pagamento TIMESTAMP
);

-- Criar tabela de ranking
CREATE TABLE ranking (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES usuarios(id),
  posicao INT,
  pontos_totais INT DEFAULT 0,
  cravadas INT DEFAULT 0,
  resultados INT DEFAULT 0,
  campeao_acertou BOOLEAN DEFAULT FALSE,
  vice_acertou BOOLEAN DEFAULT FALSE,
  artilheiro_acertou BOOLEAN DEFAULT FALSE,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_palpites_usuario ON palpites(usuario_id);
CREATE INDEX idx_palpites_jogo ON palpites(jogo_id);
CREATE INDEX idx_apostas_usuario ON apostas_extras(usuario_id);
CREATE INDEX idx_jogos_status ON jogos(status);
CREATE INDEX idx_ranking_posicao ON ranking(posicao);