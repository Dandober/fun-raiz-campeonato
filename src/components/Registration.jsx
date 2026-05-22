import { useState } from 'react';
import { useStore } from '../store';

// Up to 8 groups — background and foreground colors
const GROUP_BG = ['#3b82f6','#22c55e','#f97316','#a855f7','#ec4899','#ef4444','#14b8a6','#6366f1'];
const GROUP_FG = ['#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff'];

function ConfigurarTorneio() {
  const { state, dispatch } = useStore();
  const { config, duplas } = state;

  const duplasPorGrupo = config.numGrupos > 0
    ? Math.ceil(duplas.length / config.numGrupos)
    : 0;
  const totalPartidas = config.numGrupos * Math.max(0, duplasPorGrupo * (duplasPorGrupo - 1) / 2);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Configurar Torneio</h2>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipo de Duplas</p>
        <div className="flex gap-2">
          {[
            { key: 'masculino', label: '👨 Masculino' },
            { key: 'feminino',  label: '👩 Feminino'  },
            { key: 'misto',     label: '👫 Misto'      },
          ].map(({ key, label }) => (
            <button key={key} type="button"
              onClick={() => dispatch({ type: 'SET_CONFIG', config: { tipo: key } })}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors border-2 ${
                config.tipo === key
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Número de Grupos</p>
        <div className="flex gap-2">
          {[2, 4, 8].map(n => (
            <button key={n} type="button"
              onClick={() => dispatch({ type: 'SET_CONFIG', config: { numGrupos: n } })}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors border-2 ${
                config.numGrupos === n
                  ? 'bg-orange-400 border-orange-400 text-white'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300'
              }`}>
              {n} grupos
            </button>
          ))}
        </div>
      </div>

      <button type="button"
        onClick={() => dispatch({ type: 'SET_CONFIG', config: { terceirolugar: !config.terceirolugar } })}
        className="flex items-center gap-2 text-sm font-medium w-full">
        <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          config.terceirolugar ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
        }`}>
          {config.terceirolugar && <span className="text-white text-xs font-bold">✓</span>}
        </span>
        <span className={config.terceirolugar ? 'text-blue-600' : 'text-gray-400'}>
          Disputa de 3º lugar
        </span>
      </button>

      {duplas.length > 0 && (
        <div className="mt-4 bg-orange-50 rounded-xl px-4 py-3 text-xs text-orange-700">
          <span className="font-semibold">{duplas.length} duplas</span>
          {' · '}
          <span>{config.numGrupos} grupos de ~{duplasPorGrupo} duplas</span>
          {' · '}
          <span>~{totalPartidas} jogos na fase de grupos</span>
        </div>
      )}
    </div>
  );
}

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
      <button type="button" onClick={() => setAberto(v => !v)}
        className="w-full flex items-center justify-between">
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
  const [sel1, setSel1] = useState(null);
  const [sel2, setSel2] = useState(null);

  const { tipo } = state.config;
  const emDupla = new Set(state.duplas.flatMap(d => d.jogadores.map(j => j.id)));

  let col1, col2, label1, label2, cor1, cor2;

  if (tipo === 'misto') {
    col1 = state.jogadores.filter(j => j.genero === 'M' && !emDupla.has(j.id));
    col2 = state.jogadores.filter(j => j.genero === 'F' && !emDupla.has(j.id));
    label1 = '👨 Homens';
    label2 = '👩 Mulheres';
    cor1 = 'blue';
    cor2 = 'pink';
  } else {
    const g = tipo === 'masculino' ? 'M' : 'F';
    const todos = state.jogadores.filter(j => j.genero === g && !emDupla.has(j.id));
    col1 = todos.filter(j => j.id !== sel2);
    col2 = todos.filter(j => j.id !== sel1);
    label1 = tipo === 'masculino' ? '👨 Jogador 1' : '👩 Jogadora 1';
    label2 = tipo === 'masculino' ? '👨 Jogador 2' : '👩 Jogadora 2';
    cor1 = tipo === 'masculino' ? 'blue' : 'pink';
    cor2 = tipo === 'masculino' ? 'blue' : 'pink';
  }

  const temDisponiveis = col1.length > 0 || col2.length > 0 || sel1 || sel2;
  if (!temDisponiveis) return null;

  function confirmarDupla() {
    if (!sel1 || !sel2) return;
    dispatch({ type: 'CRIAR_DUPLA', jogador1Id: sel1, jogador2Id: sel2 });
    setSel1(null);
    setSel2(null);
  }

  function BtnJogador({ jogador, selecionado, onClick, cor }) {
    const sel = cor === 'blue'
      ? 'bg-blue-500 border-blue-500 text-white shadow-md'
      : 'bg-pink-500 border-pink-500 text-white shadow-md';
    const normal = cor === 'blue'
      ? 'bg-blue-50 border-transparent text-blue-800 hover:border-blue-300'
      : 'bg-pink-50 border-transparent text-pink-800 hover:border-pink-300';
    return (
      <button type="button" onClick={onClick}
        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all border-2 ${selecionado ? sel : normal}`}>
        {jogador.nome}
      </button>
    );
  }

  const nome1 = sel1 ? state.jogadores.find(j => j.id === sel1)?.nome : null;
  const nome2 = sel2 ? state.jogadores.find(j => j.id === sel2)?.nome : null;
  const hint1 = label1.split(' ').slice(1).join(' ') || 'jogador';
  const hint2 = label2.split(' ').slice(1).join(' ') || 'jogador';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Montar Duplas</h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${cor1 === 'blue' ? 'text-blue-500' : 'text-pink-500'}`}>
            {label1}
          </p>
          {col1.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Todos na dupla</p>
          ) : (
            <ul className="space-y-1.5">
              {col1.map(j => (
                <li key={j.id}>
                  <BtnJogador jogador={j} selecionado={sel1 === j.id}
                    onClick={() => setSel1(sel1 === j.id ? null : j.id)} cor={cor1} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${cor2 === 'blue' ? 'text-blue-500' : 'text-pink-500'}`}>
            {label2}
          </p>
          {col2.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Todos na dupla</p>
          ) : (
            <ul className="space-y-1.5">
              {col2.map(j => (
                <li key={j.id}>
                  <BtnJogador jogador={j} selecionado={sel2 === j.id}
                    onClick={() => setSel2(sel2 === j.id ? null : j.id)} cor={cor2} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(sel1 || sel2) && (
        <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl p-3 mb-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1 font-medium">Dupla selecionada:</p>
          <p className="text-gray-800 font-semibold text-sm">
            {nome1 ?? <span className="text-gray-400 italic">selecione {hint1}</span>}
            {' '}&{' '}
            {nome2 ?? <span className="text-gray-400 italic">selecione {hint2}</span>}
          </p>
        </div>
      )}

      <button onClick={confirmarDupla} disabled={!sel1 || !sel2}
        className={`w-full font-bold py-3 rounded-xl transition-all text-sm ${
          sel1 && sel2
            ? 'bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-md hover:opacity-90'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}>
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
  const minDuplas = state.config.numGrupos * 2;
  const podeIniciar = state.duplas.length >= minDuplas;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 p-4">
      <div className="max-w-lg mx-auto">

        <div className="flex items-center justify-between pt-4 mb-6">
          <div className="text-center flex-1">
            <img src="/Logo.png" alt="Fun Raiz" className="h-12 w-12 object-contain rounded-full shadow mx-auto mb-1" />
            <h1 className="text-2xl font-bold text-white drop-shadow leading-tight">Campeonato Fun Raiz</h1>
            <p className="text-blue-100 text-xs mt-0.5">Beach Tennis · Admin</p>
          </div>
          <button onClick={onLogout} className="text-white/70 hover:text-white text-sm transition-colors">Sair</button>
        </div>

        <ConfigurarTorneio />
        <Patrocinadores />

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

        {state.jogadores.length >= 2 && <CriadorDuplas />}

        {state.duplas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-700">
                Duplas <span className="text-blue-500 font-bold">{state.duplas.length}</span>
              </h2>
              {/* Per-group count summary */}
              <div className="flex gap-1">
                {Array.from({ length: state.config.numGrupos }, (_, gi) => {
                  const count = state.duplas.filter(d => (state.preAssign || {})[d.id] === gi).length;
                  return (
                    <span key={gi} className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: GROUP_BG[gi], color: GROUP_FG[gi] }}>
                      {String.fromCharCode(65 + gi)}{count > 0 ? `:${count}` : ''}
                    </span>
                  );
                })}
              </div>
            </div>
            <ul className="space-y-2">
              {state.duplas.map((dupla, i) => {
                const grupoAtual = (state.preAssign || {})[dupla.id];
                return (
                  <li key={dupla.id} className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl px-3 py-2.5 border border-blue-100">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Dupla {i + 1}</span>
                        <p className="text-gray-800 font-medium text-sm truncate">
                          {dupla.jogadores.map(j => j.nome).join(' & ')}
                        </p>
                      </div>
                      {/* Group selector */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {Array.from({ length: state.config.numGrupos }, (_, gi) => (
                          <button key={gi} type="button"
                            onClick={() => dispatch({
                              type: 'SET_PRE_ASSIGN',
                              duplaId: dupla.id,
                              grupoIndex: grupoAtual === gi ? null : gi,
                            })}
                            className="w-7 h-7 rounded-lg text-xs font-bold transition-all border-2"
                            style={grupoAtual === gi
                              ? { background: GROUP_BG[gi], color: GROUP_FG[gi], borderColor: GROUP_BG[gi] }
                              : { background: 'white', color: '#9ca3af', borderColor: '#e5e7eb' }
                            }>
                            {String.fromCharCode(65 + gi)}
                          </button>
                        ))}
                        <button onClick={() => dispatch({ type: 'REMOVER_DUPLA', id: dupla.id })}
                          className="text-gray-300 hover:text-red-500 transition-colors text-xl leading-none ml-1">×</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {/* Assignment status hint */}
            {(() => {
              const assigned = state.duplas.filter(d => {
                const gi = (state.preAssign || {})[d.id];
                return gi !== undefined && gi >= 0 && gi < state.config.numGrupos;
              }).length;
              const total = state.duplas.length;
              if (total === 0) return null;
              if (assigned === total) return (
                <p className="text-xs text-green-600 mt-3 font-medium">✓ Todos os grupos definidos — distribuição manual será usada</p>
              );
              if (assigned === 0) return (
                <p className="text-xs text-gray-400 mt-3">Clique nas letras para definir o grupo de cada dupla (opcional)</p>
              );
              return (
                <p className="text-xs text-orange-500 mt-3">{assigned}/{total} duplas com grupo definido — distribuição aleatória para as restantes</p>
              );
            })()}
          </div>
        )}

        <div className="space-y-3 pb-8">
          {podeIniciar ? (
            <button
              onClick={() => dispatch({ type: 'INICIAR_GRUPOS' })}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:opacity-90 transition-opacity">
              Iniciar Fase de Grupos →
            </button>
          ) : state.duplas.length > 0 && (
            <div className="bg-white/20 rounded-2xl py-3 px-4 text-white/80 text-sm text-center">
              Mínimo {minDuplas} duplas para {state.config.numGrupos} grupos
              ({state.duplas.length}/{minDuplas})
            </div>
          )}
          {state.jogadores.length > 0 && (
            <button
              onClick={() => { if (confirm('Resetar jogadores e partidas?')) dispatch({ type: 'RESETAR' }); }}
              className="w-full bg-white/30 text-white font-medium py-2.5 rounded-2xl hover:bg-white/40 transition-colors text-sm">
              Resetar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
