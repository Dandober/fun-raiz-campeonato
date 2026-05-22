import { useStore } from '../store';

function NomeDupla({ dupla }) {
  if (!dupla) return <span className="text-gray-400 italic">BYE</span>;
  return <span>{dupla.jogadores.map(j => j.nome).join(' & ')}</span>;
}

function PartidaKnockout({ partida, faseId }) {
  const { dispatch } = useStore();

  function updateScore(field, value) {
    dispatch({ type: 'UPDATE_SCORE_KNOCKOUT', faseId, matchId: partida.id, field, value });
  }
  function setVencedor(duplaId) {
    dispatch({ type: 'SET_VENCEDOR_KNOCKOUT', faseId, matchId: partida.id, vencedorId: duplaId });
  }

  const v1 = partida.vencedor === partida.dupla1.id;
  const v2 = partida.vencedor === partida.dupla2?.id;

  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
      <div onClick={() => setVencedor(partida.dupla1.id)}
        className={`flex items-center justify-between rounded-xl px-3 py-2.5 mb-2 cursor-pointer transition-colors border-2 ${
          v1 ? 'bg-green-100 border-green-400' : 'bg-gray-50 border-transparent hover:bg-blue-50'
        }`}>
        <span className={`font-medium text-sm ${v1 ? 'text-green-800' : 'text-gray-800'}`}>
          {v1 && '🏆 '}<NomeDupla dupla={partida.dupla1} />
        </span>
        <input
          className="w-12 text-center border border-gray-200 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          value={partida.score1}
          onChange={e => updateScore('score1', e.target.value)}
          onClick={e => e.stopPropagation()}
          placeholder="0"
        />
      </div>

      <div className="text-center text-xs text-gray-400 font-semibold my-1">VS</div>

      <div onClick={() => setVencedor(partida.dupla2.id)}
        className={`flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-colors border-2 ${
          v2 ? 'bg-green-100 border-green-400' : 'bg-gray-50 border-transparent hover:bg-blue-50'
        }`}>
        <span className={`font-medium text-sm ${v2 ? 'text-green-800' : 'text-gray-800'}`}>
          {v2 && '🏆 '}<NomeDupla dupla={partida.dupla2} />
        </span>
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
          Vencedor: {v1
            ? partida.dupla1.jogadores.map(j => j.nome).join(' & ')
            : partida.dupla2.jogadores.map(j => j.nome).join(' & ')}
        </p>
      )}
    </div>
  );
}

export default function KnockoutAdmin({ onLogout }) {
  const { state, dispatch } = useStore();
  const { knockoutFases } = state;

  // Champion from Final
  const finalFase = knockoutFases.find(f => f.nome === 'Final');
  const finalMatch = finalFase?.partidas[0];
  const campeoes = finalMatch?.vencedor
    ? (finalMatch.vencedor === finalMatch.dupla1.id ? finalMatch.dupla1 : finalMatch.dupla2)
        .jogadores.map(j => j.nome).join(' & ')
    : null;

  // Check if we can advance to next phase
  const ultimaFase = knockoutFases[knockoutFases.length - 1];
  const ultimaCompleta = ultimaFase?.partidas.every(p => p.vencedor) ?? false;
  const isTerminal = ['Final', '3º Lugar'].includes(ultimaFase?.nome);
  const podeAvancar = ultimaCompleta && !isTerminal;

  function proxFaseNome() {
    const n = ultimaFase?.partidas.length ?? 0;
    if (n >= 4) return 'Semifinal';
    if (n === 2) return 'Final';
    return 'Próxima Fase';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 p-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between pt-4 mb-6">
          <div className="text-center flex-1">
            <img src="/Logo.png" alt="Fun Raiz" className="h-12 w-12 object-contain rounded-full shadow mx-auto mb-1" />
            <h1 className="text-2xl font-bold text-white drop-shadow">Mata-Mata</h1>
            <p className="text-pink-100 text-xs mt-0.5">Toque em uma dupla para marcar como vencedora</p>
          </div>
          <button onClick={onLogout} className="text-white/70 hover:text-white text-sm transition-colors">Sair</button>
        </div>

        {/* Champion */}
        {campeoes && (
          <div className="bg-yellow-400 rounded-2xl p-5 mb-6 text-center shadow-lg">
            <div className="text-4xl mb-2">🥇</div>
            <p className="text-yellow-900 font-bold text-xl">Campeões!</p>
            <p className="text-yellow-800 font-semibold mt-1">{campeoes}</p>
          </div>
        )}

        {/* Phases */}
        {knockoutFases.map(fase => (
          <div key={fase.id} className="mb-6">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3 px-1">
              {fase.nome}
            </h2>
            <div className="space-y-3">
              {fase.partidas.map(partida => (
                <PartidaKnockout key={partida.id} partida={partida} faseId={fase.id} />
              ))}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="space-y-3 pb-8">
          {podeAvancar && (
            <button
              onClick={() => dispatch({ type: 'AVANCAR_FASE_KNOCKOUT' })}
              className="w-full bg-white text-pink-600 font-bold py-3.5 rounded-2xl shadow-lg hover:bg-pink-50 transition-colors">
              Avançar para {proxFaseNome()} →
            </button>
          )}
          <button
            onClick={() => dispatch({ type: 'VOLTAR_GRUPOS' })}
            className="w-full bg-white/30 text-white font-medium py-2.5 rounded-2xl hover:bg-white/40 transition-colors text-sm">
            ← Voltar à Fase de Grupos
          </button>
          <button
            onClick={() => { if (confirm('Resetar o campeonato?')) dispatch({ type: 'RESETAR' }); }}
            className="w-full bg-white/20 text-white font-medium py-2.5 rounded-2xl hover:bg-white/30 transition-colors text-sm">
            Resetar Campeonato
          </button>
        </div>
      </div>
    </div>
  );
}
