import { useState, useEffect } from 'react';
import { supabase, TABLE, ROW_ID } from '../supabase';
import { initialState, getStandings } from '../store';

const SPONSORS = [
  '/PatrocinioBP2.png',
  '/PatrocinioDupla.png',
  '/PatrocinioEccoDog.png',
  '/PatrocinioFinaFlor.png',
  '/PatrocinioFlexadin.png',
  '/PatrocinioKarina.png',
  '/PatrocinioNogueira.png',
  '/PatrocinioRoberta.png',
  '/PatrocinioSmash.png',
  '/PatrocinioTorres.png',
  '/PatrocinioVet.PNG',
];

function PatrocinadorCarousel() {
  const [atual, setAtual] = useState(0);
  const [visivel, setVisivel] = useState(true);

  function irPara(index) {
    setVisivel(false);
    setTimeout(() => { setAtual(index); setVisivel(true); }, 400);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setVisivel(false);
      setTimeout(() => {
        setAtual(i => (i + 1) % SPONSORS.length);
        setVisivel(true);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-5">
      <div className="px-4 pt-3 pb-1">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest text-center">Patrocinadores</p>
      </div>
      <div className="mx-6 h-36 relative">
        <img src={SPONSORS[atual]} alt={`Patrocinador ${atual + 1}`}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'contain', objectPosition: 'center',
            opacity: visivel ? 1 : 0, transition: 'opacity 0.4s ease-in-out',
          }}
        />
      </div>
      <div className="flex items-center justify-center gap-1.5 pb-3 pt-1">
        {SPONSORS.map((_, i) => (
          <button key={i} onClick={() => irPara(i)}
            className="transition-all duration-300 rounded-full"
            style={{ width: i === atual ? 18 : 6, height: 6, background: i === atual ? '#f97316' : '#d1d5db' }}
            aria-label={`Patrocinador ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

function NomeDupla({ dupla }) {
  if (!dupla) return <span className="text-gray-400 italic text-xs">BYE</span>;
  return <span>{dupla.jogadores.map(j => j.nome).join(' & ')}</span>;
}

function PartidaLeitura({ partida }) {
  const isBye = partida.dupla2 === null;
  const v1 = partida.vencedor === partida.dupla1?.id;
  const v2 = partida.vencedor === partida.dupla2?.id;

  if (isBye) {
    return (
      <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-green-500">✓</span>
          <p className="font-semibold text-gray-700 text-sm"><NomeDupla dupla={partida.dupla1} /></p>
          <span className="text-xs text-gray-400 ml-auto">Bye</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
      <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 mb-2 border-2 ${
        v1 ? 'bg-green-100 border-green-400' : 'bg-gray-50 border-transparent'
      }`}>
        <span className={`font-medium text-sm ${v1 ? 'text-green-800' : 'text-gray-700'}`}>
          {v1 && '🏆 '}<NomeDupla dupla={partida.dupla1} />
        </span>
        <span className={`text-xl font-bold min-w-[32px] text-center ${v1 ? 'text-green-700' : 'text-gray-400'}`}>
          {partida.score1 || '—'}
        </span>
      </div>
      <div className="text-center text-xs text-gray-400 font-semibold my-1">VS</div>
      <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 border-2 ${
        v2 ? 'bg-green-100 border-green-400' : 'bg-gray-50 border-transparent'
      }`}>
        <span className={`font-medium text-sm ${v2 ? 'text-green-800' : 'text-gray-700'}`}>
          {v2 && '🏆 '}<NomeDupla dupla={partida.dupla2} />
        </span>
        <span className={`text-xl font-bold min-w-[32px] text-center ${v2 ? 'text-green-700' : 'text-gray-400'}`}>
          {partida.score2 || '—'}
        </span>
      </div>
      {!partida.vencedor && (
        <p className="text-xs text-orange-500 text-center mt-2 font-medium">⏳ Em andamento</p>
      )}
    </div>
  );
}

function GruposAtleta({ grupos }) {
  const [grupoAtivo, setGrupoAtivo] = useState(0);
  const grupo = grupos[grupoAtivo];
  const standings = grupo ? getStandings(grupo) : [];

  return (
    <div className="mb-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {grupos.map((g, i) => {
          const completo = g.partidas.length > 0 && g.partidas.every(p => p.vencedor);
          return (
            <button key={g.id} onClick={() => setGrupoAtivo(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                grupoAtivo === i ? 'bg-white text-orange-600 shadow' : 'bg-white/20 text-white hover:bg-white/30'
              }`}>
              {g.nome}{completo && ' ✓'}
            </button>
          );
        })}
      </div>

      {grupo && (
        <>
          {/* Matches */}
          <div className="space-y-3 mb-3">
            {grupo.partidas.map(p => <PartidaLeitura key={p.id} partida={p} />)}
          </div>

          {/* Standings */}
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
                    <td className="py-2 pr-2">
                      <span className={`inline-block w-4 h-4 rounded-full text-white text-xs font-bold text-center leading-4 mr-1 ${i < 2 ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {i + 1}
                      </span>
                      <span className={i < 2 ? 'font-semibold text-green-700' : 'text-gray-700'}>
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
            <p className="text-xs text-gray-400 mt-2">V Vitória · D Derrota · SG Sets Ganhos · SP Sets Perdidos</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function AtletaView({ onLogout }) {
  const [dados, setDados] = useState(initialState);
  const [ultimaAtt, setUltimaAtt] = useState(Date.now());
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    supabase.from(TABLE).select('dados').eq('id', ROW_ID).single()
      .then(({ data }) => {
        if (data?.dados) {
          setDados({ ...initialState, ...data.dados });
          setUltimaAtt(Date.now());
          setSegundos(0);
        }
      });

    const channel = supabase.channel('estado_campeonato_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, payload => {
        if (payload.new?.dados) {
          setDados({ ...initialState, ...payload.new.dados });
          setUltimaAtt(Date.now());
          setSegundos(0);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setSegundos(Math.floor((Date.now() - ultimaAtt) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [ultimaAtt]);

  function refresh() {
    supabase.from(TABLE).select('dados').eq('id', ROW_ID).single()
      .then(({ data }) => {
        if (data?.dados) {
          setDados({ ...initialState, ...data.dados });
          setUltimaAtt(Date.now());
          setSegundos(0);
        }
      });
  }

  const fase = dados?.fase ?? 'inscricao';
  const grupos = dados?.grupos ?? [];
  const knockoutFases = dados?.knockoutFases ?? [];

  // Champion
  const finalFase = knockoutFases.find(f => f.nome === 'Final');
  const finalMatch = finalFase?.partidas[0];
  const campeoes = finalMatch?.vencedor
    ? (finalMatch.vencedor === finalMatch.dupla1.id ? finalMatch.dupla1 : finalMatch.dupla2)
        .jogadores.map(j => j.nome).join(' & ')
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 p-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between pt-4 mb-5">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="Fun Raiz" className="h-14 w-14 object-contain rounded-full shadow-lg" />
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow leading-tight">Campeonato Fun Raiz</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  AO VIVO
                </span>
                <span className="text-white/60 text-xs">
                  {segundos < 60 ? `há ${segundos}s` : `há ${Math.floor(segundos / 60)}min`}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={refresh}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">↻</button>
            <button onClick={onLogout} className="text-white/60 hover:text-white text-sm transition-colors">Sair</button>
          </div>
        </div>

        <PatrocinadorCarousel />

        {/* Champion */}
        {campeoes && (
          <div className="bg-yellow-400 rounded-2xl p-5 mb-5 text-center shadow-lg">
            <div className="text-4xl mb-2">🥇</div>
            <p className="text-yellow-900 font-bold text-xl">Campeões!</p>
            <p className="text-yellow-800 font-semibold mt-1">{campeoes}</p>
          </div>
        )}

        {/* Waiting */}
        {fase === 'inscricao' && (
          <div className="bg-white/20 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">⏳</div>
            <p className="text-white font-semibold text-lg">Aguardando início</p>
            <p className="text-white/70 text-sm mt-1">O campeonato ainda não começou.</p>
          </div>
        )}

        {/* Group stage */}
        {fase === 'grupos' && grupos.length > 0 && (
          <>
            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3 px-1">Fase de Grupos</h2>
            <GruposAtleta grupos={grupos} />
          </>
        )}

        {/* Knockout stage */}
        {fase === 'knockout' && (
          <>
            {/* Also show groups summary */}
            {grupos.length > 0 && (
              <details className="mb-5">
                <summary className="text-white font-bold text-sm uppercase tracking-widest mb-3 px-1 cursor-pointer">
                  Fase de Grupos ▼
                </summary>
                <div className="mt-3">
                  <GruposAtleta grupos={grupos} />
                </div>
              </details>
            )}

            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3 px-1">Mata-Mata</h2>
            {knockoutFases.map(fase => (
              <div key={fase.id} className="mb-6">
                <h3 className="text-white/80 font-semibold text-xs uppercase tracking-wide mb-2 px-1">
                  {fase.nome}
                </h3>
                <div className="space-y-3">
                  {fase.partidas.map(partida => (
                    <PartidaLeitura key={partida.id} partida={partida} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}
