import { useState } from 'react';
import { useStore, getStandings } from '../store';

function NomeDupla({ dupla }) {
  if (!dupla) return <span className="text-gray-400 italic">BYE</span>;
  return <span>{dupla.jogadores.map(j => j.nome).join(' & ')}</span>;
}

function PartidaGrupo({ partida, grupoId }) {
  const { dispatch } = useStore();

  function updateScore(field, value) {
    dispatch({ type: 'UPDATE_SCORE_GRUPO', grupoId, matchId: partida.id, field, value });
  }
  function setVencedor(duplaId) {
    dispatch({ type: 'SET_VENCEDOR_GRUPO', grupoId, matchId: partida.id, vencedorId: duplaId });
  }

  const v1 = partida.vencedor === partida.dupla1.id;
  const v2 = partida.vencedor === partida.dupla2?.id;

  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
      <div
        onClick={() => setVencedor(partida.dupla1.id)}
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
          placeholder="0" type="number" min="0" max="7"
        />
      </div>

      <div className="text-center text-xs text-gray-400 font-semibold my-1">VS</div>

      <div
        onClick={() => setVencedor(partida.dupla2.id)}
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
          placeholder="0" type="number" min="0" max="7"
        />
      </div>

      {!partida.vencedor && (
        <p className="text-xs text-orange-500 text-center mt-2 font-medium">⏳ Em andamento</p>
      )}
    </div>
  );
}

function TabelaClassificacao({ grupo }) {
  const standings = getStandings(grupo);
  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Classificação</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 border-b border-gray-100">
            <th className="text-left pb-2 font-medium">Dupla</th>
            <th className="text-center pb-2 font-medium">V</th>
            <th className="text-center pb-2 font-medium">D</th>
            <th className="text-center pb-2 font-medium">SG</th>
            <th className="text-center pb-2 font-medium">SP</th>
            <th className="text-center pb-2 font-medium">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.dupla.id} className={`border-b border-gray-50 last:border-0 ${i < 2 ? 'bg-green-50' : ''}`}>
              <td className="py-2 pr-2 flex items-center gap-1.5">
                <span className={`w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                  i < 2 ? 'bg-green-500' : 'bg-gray-300'
                }`}>{i + 1}</span>
                <span className={`truncate max-w-[80px] ${i < 2 ? 'font-semibold text-green-700' : 'text-gray-700'}`}>
                  {s.dupla.jogadores.map(j => j.nome.split(' ')[0]).join(' & ')}
                </span>
              </td>
              <td className="text-center py-2 font-bold text-green-600">{s.vitorias}</td>
              <td className="text-center py-2 text-red-400">{s.derrotas}</td>
              <td className="text-center py-2 text-gray-600">{s.jogosFavor}</td>
              <td className="text-center py-2 text-gray-600">{s.jogosContra}</td>
              <td className="text-center py-2 font-semibold">
                <span className={s.jogosFavor - s.jogosContra >= 0 ? 'text-green-600' : 'text-red-400'}>
                  {s.jogosFavor - s.jogosContra > 0 ? '+' : ''}{s.jogosFavor - s.jogosContra}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-green-600 mt-2 font-medium">✓ Top 2 avançam para o mata-mata</p>
      <p className="text-xs text-gray-400 mt-1">V Vitória · D Derrota · SG Sets Ganhos · SP Sets Perdidos</p>
    </div>
  );
}

export default function GruposAdmin({ onLogout }) {
  const { state, dispatch } = useStore();
  const [grupoAtivo, setGrupoAtivo] = useState(0);
  const { grupos } = state;

  const totalPartidas = grupos.reduce((a, g) => a + g.partidas.length, 0);
  const partidasConcluidas = grupos.reduce((a, g) => a + g.partidas.filter(p => p.vencedor).length, 0);
  const todosCompletos = totalPartidas > 0 && partidasConcluidas === totalPartidas;

  const grupo = grupos[grupoAtivo];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 p-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between pt-4 mb-5">
          <div className="text-center flex-1">
            <img src="/Logo.png" alt="Fun Raiz" className="h-12 w-12 object-contain rounded-full shadow mx-auto mb-1" />
            <h1 className="text-2xl font-bold text-white drop-shadow leading-tight">Fase de Grupos</h1>
            <p className="text-blue-100 text-xs mt-0.5">
              {partidasConcluidas}/{totalPartidas} partidas concluídas
            </p>
          </div>
          <button onClick={onLogout} className="text-white/70 hover:text-white text-sm transition-colors">Sair</button>
        </div>

        {/* Group tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {grupos.map((g, i) => {
            const completo = g.partidas.length > 0 && g.partidas.every(p => p.vencedor);
            return (
              <button key={g.id} onClick={() => setGrupoAtivo(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  grupoAtivo === i
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'bg-white/30 text-white hover:bg-white/40'
                }`}>
                {g.nome}
                {completo && <span className="ml-1">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Group content */}
        {grupo && (
          <div className="space-y-3 mb-4">
            {grupo.partidas.map(partida => (
              <PartidaGrupo key={partida.id} partida={partida} grupoId={grupo.id} />
            ))}
            <TabelaClassificacao grupo={grupo} />
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pb-8">
          {todosCompletos && (
            <button
              onClick={() => dispatch({ type: 'INICIAR_KNOCKOUT' })}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:opacity-90 transition-opacity">
              Avançar para Mata-Mata →
            </button>
          )}
          <button
            onClick={() => dispatch({ type: 'VOLTAR_INSCRICAO' })}
            className="w-full bg-white/30 text-white font-medium py-2.5 rounded-2xl hover:bg-white/40 transition-colors text-sm">
            ← Voltar às Inscrições
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
