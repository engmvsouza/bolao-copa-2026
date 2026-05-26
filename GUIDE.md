# Bolão Copa 2026 - Guia de Instalação e Uso

## 🚀 Começando

### Requisitos
- Docker e Docker Compose instalados
- Git
- Node.js 18+ (se rodar localmente sem Docker)

### Instalação Rápida

1. Clone o repositório:
```bash
git clone https://github.com/engmvsouza/bolao-copa-2026.git
cd bolao-copa-2026
```

2. Inicie tudo com Docker:
```bash
docker-compose up --build
```

3. Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432

## 📋 Configuração Inicial

### Primeiro Acesso
1. Você será levado à página de login
2. Como admin, use as credenciais padrão (será fornecido via email)
3. Gere códigos de convite no painel administrativo
4. Compartilhe com seus amigos

## 🎮 Como Usar

### Fazer Palpites
1. Acesse `/apostas`
2. Escolha cada jogo
3. Digite seu palpite de placar (ex: 2×1)
4. Salve antes do bloqueio automático (60 min antes)

### Ver Ranking
1. Acesse `/ranking`
2. Veja sua posição e pontuação
3. Ranking atualiza em tempo real

## 📊 Sistema de Pontuação

| Acerto | Pontos |
|--------|--------|
| Placar Exato | 10 pts |
| Resultado Correto | 5 pts |
| Apostas Extras | 15 pts |

## 💰 Premiação

Com N participantes que pagaram €50:
- **Total do Prêmio**: N × €50 × 0.85 (15% para custos)
- **1º Lugar**: 50% do prêmio
- **2º Lugar**: 25% do prêmio
- **3º Lugar**: 10% do prêmio

## 🔧 Painel Administrativo

Apenas administradores podem:
- Adicionar novos jogos
- Atualizar resultados
- Gerenciar usuários
- Gerar convites
- Ver relatórios

## 🛠️ Desenvolvedor

Se precisa fazer alterações:

```bash
# Instale dependências
cd backend && npm install
cd ../frontend && npm install

# Execute em desenvolvimento (sem Docker)
cd backend && npm run dev
cd frontend && npm start
```

## 🐛 Troubleshooting

**Erro ao conectar no banco de dados**
```bash
docker-compose down -v
docker-compose up --build
```

**Porta já em uso**
```bash
# Altere as portas em docker-compose.yml
```

**Banco de dados vazio**
```bash
# Acesse o container e execute:
psql -U bolao -d bolao_copa_2026 < database/schema.sql
```

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com o administrador do bolão.