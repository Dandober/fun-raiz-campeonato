import { useState, useEffect } from 'react';
import { supabase, TABLE, ROW_ID } from '../supabase';
import { initialState } from '../store';

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
    setTimeout(() => {
      setAtual(index);
      setVisivel(true);
    }, 400);
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
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest text-center">
          Patrocinadores
        </p>
      </div>

      <div className="mx-6 h-36 relative">
        <img
          src={SPONSORS[atual]}
          alt={`Patrocinador ${atual + 1}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            opacity: visivel ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out',
          }}
        />
      </div>

      <div className="flex items-center justify-center gap-1.5 pb-3 pt-1">
        {SPONSORS.map((_, i) => (
          <button
            key={i}
            onClick={() => irPara(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === atual ? 18 : 6,
              height: 6,
              background: i === atual ? '#f97316' : '#d1d5db',
            }}
            aria-label={`Patrocinador ${i + 1}`}
          />
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
  const temVencedor = partida.vencedor !== null;

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

  const v1 = temVencedor && partida.vencedor === partida.dupla1.id;
  const v2 = temVencedor && partida.vencedor === partida.dupla2.id;

  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
      <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 mb-2 ${
        v1 ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-50 border-2 border-transparent'
      }`}>
        <span className={`font-medium text-sm flex items-center gap-1.5 ${v1 ? 'text-green-800' : 'text-gray-700'}`}>
          {v1 && '🏆 '}
          <NomeDupla dupla={partida.dupla1} />
        </span>
        <span className={`text-xl font-bold min-w-[32px] text-center ${v1 ? 'text-green-700' : 'text-gray-400'}`}>
          {partida.score1 || '—'}
        </span>
      </div>

      <div className="text-center text-xs text-gray-400 font-semibold my-1">VS</div>

      <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
        v2 ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-50 border-2 border-transparent'
      }`}>
        <span className={`font-medium text-sm flex items-center gap-1.5 ${v2 ? 'text-green-800' : 'text-gray-700'}`}>
          {v2 && '🏆 '}
          <NomeDupla dupla={partida.dupla2} />
        </span>
        <span className={`text-xl font-bold min-w-[32px] text-center ${v2 ? 'text-green-700' : 'text-gray-400'}`}>
          {partida.score2 || '—'}
        </span>
      </div>

      {!temVencedor && (
        <p className="text-xs text-orange-500 text-center mt-2 font-medium">⏳ Em andamento</p>
      )}
    </div>
  );
}

export default function AtletaView({ onLogout }) {
  const [dados, setDados] = useState(initialState);
  const [ultimaAtt, setUltimaAtt] = useState(Date.now());
  const [segundos, setSegundos] = useState(0);

  // Load initial data and subscribe to real-time changes
  useEffect(() => {
    // Initial fetch
    supabase
      .from(TABLE)
      .select('dados')
      .eq('id', ROW_ID)
      .single()
      .then(({ data }) => {
        if (data?.dados) {
          setDados({ ...initialState, ...data.dados });
          setUltimaAtt(Date.now());
          setSegundos(0);
        }
      });

    // Real-time subscription
    const channel = supabase
      .channel('estado_campeonato_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        payload => {
          if (payload.new?.dados) {
            setDados({ ...initialState, ...payload.new.dados });
            setUltimaAtt(Date.now());
            setSegundos(0);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Seconds counter since last update
  useEffect(() => {
    const tick = setInterval(() => {
      setSegundos(Math.floor((Date.now() - ultimaAtt) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [ultimaAtt]);

  function refresh() {
    supabase
      .from(TABLE)
      .select('dados')
      .eq('id', ROW_ID)
      .single()
      .then(({ data }) => {
        if (data?.dados) {
          setDados({ ...initialState, ...data.dados });
          setUltimaAtt(Date.now());
          setSegundos(0);
        }
      });
  }

  const rodadas = dados?.rodadas ?? [];
  const fase = dados?.fase ?? 'inscricao';

  const ultimaRodada = rodadas[rodadas.length - 1];
  const todasComVencedor = ultimaRodada?.every(m => m.vencedor !== null);
  const isFinal = ultimaRodada?.length === 1 && ultimaRodada[0]?.dupla2 !== null;
  const campeoes = isFinal && todasComVencedor
    ? (() => {
        const m = ultimaRodada[0];
        const dupla = m.vencedor === m.dupla1.id ? m.dupla1 : m.dupla2;
        return dupla.jogadores.map(j => j.nome).join(' & ');
      })()
    : null;

  function nomeRodada(ri, rodada) {
    if (rodada.length === 1 && rodada[0].dupla2 !== null) return 'Final';
    if (rodadas.length === 1) return 'Rodada 1';
    return `Rodada ${ri + 1}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 p-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between pt-4 mb-5">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="Fun Raiz" className="h-14 w-14 object-contain rounded-full shadow-lg" />
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow leading-tight">
                Campeonato Fun Raiz
              </h1>
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
            <button
              onClick={refresh}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
            >
              ↻
            </button>
            <button
              onClick={onLogout}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Sponsor carousel */}
        <PatrocinadorCarousel />

        {/* Champion banner */}
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

        {/* Bracket */}
        {rodadas.map((rodada, ri) => (
          <div key={ri} className="mb-6">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3 px-1">
              {nomeRodada(ri, rodada)}
            </h2>
            <div className="space-y-3">
              {rodada.map(partida => (
                <PartidaLeitura key={partida.id} partida={partida} />
              ))}
            </div>
          </div>
        ))}

        <div className="pb-8" />
      </div>
    </div>
  );
}
