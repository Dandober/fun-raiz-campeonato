import { useStore } from '../store';

function NomeDupla({ dupla }) {
  if (!dupla) return <span className="text-gray-400 italic">BYE</span>;
  return <span>{dupla.jogadores.map(j => j.nome).join(' & ')}</span>;
}

function Partida({ partida, rodadaIndex }) {
  const { dispatch } = useStore();
  const isBye = partida.dupla2 === null;

  function setVencedor(duplaId) {
    dispatch({ type: 'SET_VENCEDOR', rodadaIndex, matchId: partida.id, vencedorId: duplaId });
  }

  function updateScore(field, value) {
    dispatch({ type: 'UPDATE_SCORE', rodadaIndex, matchId: partida.id, field, value });
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
      {isBye ? (
        <div className="flex items-center gap-2">
          <span className="text-green-500 text-lg">✓</span>
          <div>
            <p className="font-semibold text-gray-800"><NomeDupla dupla={partida.dupla1} /></p>
            <p className="text-xs text-gray-400">Avança com bye</p>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 mb-2 cursor-pointer transition-colors ${
              partida.vencedor === partida.dupla1.id
                ? 'bg-green-100 border-2 border-green-400'
                : 'bg-gray-50 hover:bg-blue-50 border-2 border-transparent'
            }`}
            onClick={() => setVencedor(partida.dupla1.id)}
          >
            <span className="font-medium text-gray-800 text-sm"><NomeDupla dupla={partida.dupla1} /></span>
            <input
              className="w-12 text-center border border-gray-200 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              value={partida.score1}
              onChange={e => updateScore('score1', e.target.value)}
              onClick={e => e.stopPropagation()}
              placeholder="0"
            />
          </div>

          <div className="text-center text-xs text-gray-400 font-semibold my-1">VS</div>

          <div
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
              partida.vencedor === partida.dupla2.id
                ? 'bg-green-100 border-2 border-green-400'
                : 'bg-gray-50 hover:bg-blue-50 border-2 border-transparent'
            }`}
            onClick={() => setVencedor(partida.dupla2.id)}
          >
            <span className="font-medium text-gray-800 text-sm"><NomeDupla dupla={partida.dupla2} /></span>
            <input
              className="w-12 text-center border border-gray-200 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              value={partida.score2}
              onChange={e => updateScore('score2', e.target.value)}
              onClick={e => e.stopPropagation()}
              placeholder="0"
            />
          </div>

          {partida.vencedor && (
            <p className="text-xs text-green-600 mt-2 text-center font-medium">
              Vencedor: {partida.vencedor === partida.dupla1.id
                ? partida.dupla1.jogadores.map(j => j.nome).join(' & ')
                : partida.dupla2.jogadores.map(j => j.nome).join(' & ')}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function Bracket({ onLogout }) {
  const { state, dispatch } = useStore();
  const { rodadas } = state;

  const ultimaRodada = rodadas[rodadas.length - 1];
  const todasComVencedor = ultimaRodada?.every(m => m.vencedor !== null);
  const isFinal = ultimaRodada?.length === 1 && ultimaRodada[0].dupla2 !== null;

  const campeoes = isFinal && todasComVencedor
    ? (() => {
        const m = ultimaRodada[0];
        const dupla = m.vencedor === m.dupla1.id ? m.dupla1 : m.dupla2;
        return dupla.jogadores.map(j => j.nome).join(' & ');
      })()
    : null;

  function nomeRodada(ri, total, len) {
    if (len === 1 && rodadas[ri][0].dupla2 !== null) return 'Final';
    if (total === 1) return 'Rodada 1';
    return `Rodada ${ri + 1}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pt-4 mb-6">
          <div className="text-center flex-1">
            <img src="/Logo.png" alt="Fun Raiz" className="h-12 w-12 object-contain rounded-full shadow mx-auto mb-1" />
            <h1 className="text-2xl font-bold text-white drop-shadow">Chave do Campeonato</h1>
            <p className="text-pink-100 text-xs mt-0.5">Toque em uma dupla para marcar como vencedora</p>
          </div>
          <button
            onClick={onLogout}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            Sair
          </button>
        </div>

        {campeoes && (
          <div className="bg-yellow-400 rounded-2xl p-5 mb-6 text-center shadow-lg">
            <div className="text-4xl mb-2">🥇</div>
            <p className="text-yellow-900 font-bold text-xl">Campeões!</p>
            <p className="text-yellow-800 font-semibold mt-1">{campeoes}</p>
          </div>
        )}

        {rodadas.map((rodada, ri) => (
          <div key={ri} className="mb-6">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3 px-1">
              {nomeRodada(ri, rodadas.length, rodada.length)}
            </h2>
            <div className="space-y-3">
              {rodada.map(partida => (
                <Partida key={partida.id} partida={partida} rodadaIndex={ri} />
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-3 pb-8">
          {todasComVencedor && !campeoes && (
            <button
              onClick={() => dispatch({ type: 'AVANCAR_RODADA' })}
              className="w-full bg-white text-pink-600 font-bold py-3.5 rounded-2xl shadow-lg hover:bg-pink-50 transition-colors"
            >
              Próxima Rodada →
            </button>
          )}
          <button
            onClick={() => dispatch({ type: 'VOLTAR_INSCRICAO' })}
            className="w-full bg-white/30 text-white font-medium py-2.5 rounded-2xl hover:bg-white/40 transition-colors text-sm"
          >
            ← Voltar às Inscrições
          </button>
          <button
            onClick={() => { if (confirm('Resetar o campeonato?')) dispatch({ type: 'RESETAR' }); }}
            className="w-full bg-white/20 text-white font-medium py-2.5 rounded-2xl hover:bg-white/30 transition-colors text-sm"
          >
            Resetar Campeonato
          </button>
        </div>
      </div>
    </div>
  );
}
