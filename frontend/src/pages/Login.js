import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [modo, setModo] = useState('login');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        senha
      });
      localStorage.setItem('token', response.data.token);
      window.location.href = '/ranking';
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao fazer login');
    }
    setCarregando(false);
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    if (!codigoConvite) {
      setErro('Código de convite é obrigatório');
      return;
    }
    setCarregando(true);
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        email,
        senha,
        codigoConvite
      });
      localStorage.setItem('token', response.data.token);
      window.location.href = '/ranking';
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao registrar');
    }
    setCarregando(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>⚽ Bolão Copa 2026</h1>
        <p className="subtitle">Vini</p>

        {erro && <div className="erro-msg">{erro}</div>}

        <div className="tabs">
          <button
            className={`tab ${modo === 'login' ? 'ativo' : ''}`}
            onClick={() => setModo('login')}
          >
            Login
          </button>
          <button
            className={`tab ${modo === 'registro' ? 'ativo' : ''}`}
            onClick={() => setModo('registro')}
          >
            Registrar
          </button>
        </div>

        <form onSubmit={modo === 'login' ? handleLogin : handleRegistro}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {modo === 'registro' && (
            <div className="form-group">
              <label>Código de Convite</label>
              <input
                type="text"
                value={codigoConvite}
                onChange={(e) => setCodigoConvite(e.target.value)}
                required
                placeholder="Cole aqui o código de convite"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="btn-submit"
          >
            {carregando ? 'Carregando...' : (modo === 'login' ? 'Entrar' : 'Registrar')}
          </button>
        </form>

        <div className="info-box">
          <p>💡 {modo === 'login' ? 'Não tem conta? Peça um código de convite!' : 'Já tem conta? Faça login acima!'}</p>
        </div>
      </div>
    </div>
  );
}