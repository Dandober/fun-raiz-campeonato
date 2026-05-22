import { useState } from 'react';
import { useStore } from '../store';

function Patrocinadores() {
  const { state, dispatch } = useStore();
  const [nome, setNome] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [aberto, setAberto] = useState(false);

  function addPatrocinador(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    dispatch({ type: 'ADD_PATROCINADOR', nome, logoUrl });
    setNome('');
    setLogoUrl('');
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
      <button
        type="button"
        onClick={() => setAberto(v => !v)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="text-lg font-semibold text-gray-700">
          Patrocinadores
          {state.patrocinadores.length > 0 && (
            <span className="ml-2 text-amber-500 font-bold">{state.patrocinadores.length}</span>
          )}
        </h2>
        <span className="text-gray-400 text-lg">{aberto ? '▲' : '▼'}</span>
      </button>

      {aberto && (
        <div className="mt-4 space-y-3">
          {state.patrocinadores.length > 0 && (
            <ul className="space-y-2 mb-3">
              {state.patrocinadores.map(p => (
                <li key={p.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    {p.logoUrl && (
                      <img src={p.logoUrl} alt={p.nome} className="h-7 max-w-[60px] object-contain rounded"
                        onError={e => { e.target.style.display = 'none'; }} />
                    )}
                    <span className="text-gray-800 font-medium text-sm">{p.nome}</span>
                  </div>
                  <button onClick={() => dispatch({ type: 'REMOVE_PATROCINADOR', id: p.id })}
                    className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none">×</button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={addPatrocinador} className="space-y-2">
            <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              placeholder="Nome do patrocinador" value={nome} onChange={e => setNome(e.target.value)} />
            <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              placeholder="URL da logo (opcional)" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
            <button type="submit"
              className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
              + Adicionar Patrocinador
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function CriadorDuplas() {
  const { state, dispatch } = useStore();
  const [homemSel, setHomemSel] = useState(null);
  const [mulherSel, setMulherSel] = useState(null);

  // Players already assigned to a pair
  const emDupla = new Set(state.duplas.flatMap(d => d.jogadores.map(j => j.id)));

  const homensLivres = state.jogadores.filter(j => j.genero === 'M' && !emDupla.has(j.id));
  const mulheresLivres = state.jogadores.filter(j => j.genero === 'F' && !emDupla.has(j.id));

  function confirmarDupla() {
    if (!homemSel || !mulherSel) return;
    dispatch({ type: 'CRIAR_DUPLA', homemId: homemSel, mulherId: mulherSel });
    setHomemSel(null);
    setMulherSel(null);
  }

  if (homensLivres.length === 0 && mulheresLivres.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Montar Duplas</h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Homens */}
        <div>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            👨 Homens
          </p>
          {homensLivres.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Todos na dupla</p>
          ) : (
            <ul className="space-y-1.5">
              {homensLivres.map(j => (
                <li key={j.id}>
                  <button
                    type="button"
                    onClick={() => setHomemSel(homemSel === j.id ? null : j.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                      homemSel === j.id
                        ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                        : 'bg-blue-50 border-transparent text-blue-800 hover:border-blue-300'
                    }`}
                  >
                    {j.nome}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mulheres */}
        <div>
          <p className="text-xs font-semibold text-pink-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            👩 Mulheres
          </p>
          {mulheresLivres.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Todas na dupla</p>
          ) : (
            <ul className="space-y-1.5">
              {mulheresLivres.map(j => (
                <li key={j.id}>
                  <button
                    type="button"
                    onClick={() => setMulherSel(mulherSel === j.id ? null : j.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                      mulherSel === j.id
                        ? 'bg-pink-500 border-pink-500 text-white shadow-md'
                        : 'bg-pink-50 border-transparent text-pink-800 hover:border-pink-300'
                    }`}
                  >
                    {j.nome}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Preview + confirm */}
      {(homemSel || mulherSel) && (
        <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl p-3 mb-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1 font-medium">Dupla selecionada:</p>
          <p className="text-gray-800 font-semibold text-sm">
            {homemSel
              ? homensLivres.find(j => j.id === homemSel)?.nome
              : <span className="text-gray-400 italic">selecione um homem</span>}
            {' '}&{' '}
            {mulherSel
              ? mulheresLivres.find(j => j.id === mulherSel)?.nome
              : <span className="text-gray-400 italic">selecione uma mulher</span>}
          </p>
        </div>
      )}

      <button
        onClick={confirmarDupla}
        disabled={!homemSel || !mulherSel}
        className={`w-full font-bold py-3 rounded-xl transition-all text-sm ${
          homemSel && mulherSel
            ? 'bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-md hover:opacity-90'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Confirmar Dupla
      </button>
    </div>
  );
}

export default function Registration({ onLogout }) {
  const { state, dispatch } = useStore();
  const [nome, setNome] = useState('');
  const [genero, setGenero] = useState('M');
  const [erro, setErro] = useState('');

  function addJogador(e) {
    e.preventDefault();
    const trimmed = nome.trim();
    if (!trimmed) return;
    if (state.jogadores.some(j => j.nome.toLowerCase() === trimmed.toLowerCase())) {
      setErro('Jogador já cadastrado.');
      return;
    }
    dispatch({ type: 'ADD_JOGADOR', nome: trimmed, genero });
    setNome('');
    setErro('');
  }

  const homens = state.jogadores.filter(j => j.genero === 'M');
  const mulheres = state.jogadores.filter(j => j.genero === 'F');
  const emDupla = new Set(state.duplas.flatMap(d => d.jogadores.map(j => j.id)));
  const podeIniciar = state.duplas.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 p-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between pt-4 mb-6">
          <div className="text-center flex-1">
            <img src="/Logo.png" alt="Fun Raiz" className="h-12 w-12 object-contain rounded-full shadow mx-auto mb-1" />
            <h1 className="text-2xl font-bold text-white drop-shadow leading-tight">Campeonato Fun Raiz</h1>
            <p className="text-blue-100 text-xs mt-0.5">Beach Tennis · Admin</p>
          </div>
          <button onClick={onLogout} className="text-white/70 hover:text-white text-sm transition-colors">Sair</button>
        </div>

        {/* Patrocinadores */}
        <Patrocinadores />

        {/* Add player */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Inscrever Jogador</h2>
          <form onSubmit={addJogador} className="space-y-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => setGenero('M')}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors border-2 ${
                  genero === 'M' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                }`}>
                👨 Homem
              </button>
              <button type="button" onClick={() => setGenero('F')}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors border-2 ${
                  genero === 'F' ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-pink-300'
                }`}>
                👩 Mulher
              </button>
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nome do jogador"
                value={nome}
                onChange={e => { setNome(e.target.value); setErro(''); }}
              />
              <button type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Adicionar
              </button>
            </div>
          </form>
          {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}
        </div>

        {/* Player list */}
        {state.jogadores.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-700">
                Jogadores <span className="text-blue-500 font-bold">{state.jogadores.length}</span>
              </h2>
              <div className="flex gap-2 text-xs">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">👨 {homens.length}</span>
                <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full">👩 {mulheres.length}</span>
              </div>
            </div>
            <ul className="space-y-2">
              {state.jogadores.map((j, i) => (
                <li key={j.id} className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${
                  emDupla.has(j.id) ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      j.genero === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                    }`}>{i + 1}</span>
                    <span className="text-gray-800 font-medium">{j.nome}</span>
                    <span className="text-xs text-gray-400">{j.genero === 'M' ? '♂' : '♀'}</span>
                    {emDupla.has(j.id) && <span className="text-xs text-green-500">✓</span>}
                  </span>
                  {!emDupla.has(j.id) && (
                    <button onClick={() => dispatch({ type: 'REMOVE_JOGADOR', id: j.id })}
                      className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none">×</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pair builder */}
        {state.jogadores.length >= 2 && <CriadorDuplas />}

        {/* Pairs list */}
        {state.duplas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Duplas <span className="text-blue-500 font-bold">{state.duplas.length}</span>
            </h2>
            <ul className="space-y-2">
              {state.duplas.map((dupla, i) => (
                <li key={dupla.id} className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl px-4 py-3 border border-blue-100">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Dupla {i + 1}</span>
                    <p className="text-gray-800 font-medium mt-0.5">
                      {dupla.jogadores.map(j => j.nome).join(' & ')}
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'REMOVER_DUPLA', id: dupla.id })}
                    className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none ml-3"
                  >×</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pb-8">
          {podeIniciar && (
            <button
              onClick={() => dispatch({ type: 'INICIAR_TORNEIO' })}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
            >
              Iniciar Campeonato →
            </button>
          )}
          {state.jogadores.length > 0 && (
            <button
              onClick={() => { if (confirm('Resetar jogadores e partidas?')) dispatch({ type: 'RESETAR' }); }}
              className="w-full bg-white/30 text-white font-medium py-2.5 rounded-2xl hover:bg-white/40 transition-colors text-sm"
            >
              Resetar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
