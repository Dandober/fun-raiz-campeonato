import { useState } from 'react';

const CREDENCIAIS_ADMIN = { usuario: 'admin', senha: 'FunRaiz2026' };

export default function Login({ onLogin }) {
  const [aba, setAba] = useState('atleta'); // 'admin' | 'atleta'
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function handleAdminSubmit(e) {
    e.preventDefault();
    if (usuario === CREDENCIAIS_ADMIN.usuario && senha === CREDENCIAIS_ADMIN.senha) {
      onLogin('admin');
    } else {
      setErro('Usuário ou senha incorretos.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="Fun Raiz" className="h-28 w-28 object-contain rounded-full shadow-xl mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-white drop-shadow leading-tight">
            Campeonato<br />Fun Raiz
          </h1>
          <p className="text-emerald-100 text-sm mt-2">Beach Tennis</p>
        </div>

        {/* Tab selector */}
        <div className="flex bg-white/20 rounded-2xl p-1 mb-4">
          <button
            type="button"
            onClick={() => { setAba('atleta'); setErro(''); }}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              aba === 'atleta' ? 'bg-white text-emerald-700 shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            🎾 Atletas
          </button>
          <button
            type="button"
            onClick={() => { setAba('admin'); setErro(''); }}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              aba === 'admin' ? 'bg-white text-emerald-700 shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            ⚙️ Admin
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {aba === 'atleta' ? (
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-6">
                Acompanhe o chaveamento e os placares do campeonato em tempo real.
              </p>
              <button
                onClick={() => onLogin('atleta')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Entrar como Atleta
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-700 mb-5 text-center">Área do Administrador</h2>
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Usuário</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Digite seu usuário"
                    value={usuario}
                    onChange={e => { setUsuario(e.target.value); setErro(''); }}
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Senha</label>
                  <input
                    type="password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={e => { setSenha(e.target.value); setErro(''); }}
                    autoComplete="current-password"
                  />
                </div>
                {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Entrar
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
