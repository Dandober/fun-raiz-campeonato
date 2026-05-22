import { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { supabase, TABLE, ROW_ID } from './supabase';

export const initialState = {
  jogadores: [],
  duplas: [],
  patrocinadores: [],
  preAssign: {},       // { duplaId: grupoIndex }
  fase: 'inscricao', // 'inscricao' | 'grupos' | 'knockout'
  config: {
    tipo: 'misto',       // 'misto' | 'masculino' | 'feminino'
    numGrupos: 4,
    terceirolugar: false,
  },
  grupos: [],          // [{ id, nome, duplas, partidas }]
  knockoutFases: [],   // [{ id, nome, partidas }]
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makePartida(id, dupla1, dupla2) {
  return { id, dupla1, dupla2, score1: '', score2: '', vencedor: null };
}

function buildGroups(duplas, numGrupos) {
  const shuffled = shuffle(duplas);
  const grupos = Array.from({ length: numGrupos }, (_, i) => ({
    id: `grupo-${i}`,
    nome: `Grupo ${String.fromCharCode(65 + i)}`,
    duplas: [],
    partidas: [],
  }));

  shuffled.forEach((dupla, i) => {
    grupos[i % numGrupos].duplas.push(dupla);
  });

  const ts = Date.now();
  grupos.forEach((grupo, gi) => {
    const d = grupo.duplas;
    for (let i = 0; i < d.length; i++) {
      for (let j = i + 1; j < d.length; j++) {
        grupo.partidas.push(makePartida(`gp-${gi}-${i}-${j}-${ts}`, d[i], d[j]));
      }
    }
  });

  return grupos;
}

export function getStandings(grupo) {
  const map = {};
  grupo.duplas.forEach(d => {
    map[d.id] = { dupla: d, vitorias: 0, derrotas: 0, jogosFavor: 0, jogosContra: 0 };
  });

  grupo.partidas.forEach(p => {
    if (!p.vencedor) return;
    const s1 = parseInt(p.score1) || 0;
    const s2 = parseInt(p.score2) || 0;
    const v1 = p.vencedor === p.dupla1.id;
    if (map[p.dupla1.id]) {
      map[p.dupla1.id].jogosFavor += s1;
      map[p.dupla1.id].jogosContra += s2;
      if (v1) map[p.dupla1.id].vitorias++; else map[p.dupla1.id].derrotas++;
    }
    if (p.dupla2 && map[p.dupla2.id]) {
      map[p.dupla2.id].jogosFavor += s2;
      map[p.dupla2.id].jogosContra += s1;
      if (!v1) map[p.dupla2.id].vitorias++; else map[p.dupla2.id].derrotas++;
    }
  });

  return Object.values(map).sort((a, b) => {
    if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
    return (b.jogosFavor - b.jogosContra) - (a.jogosFavor - a.jogosContra);
  });
}

function buildKnockoutFase(id, nome, duplas) {
  const partidas = [];
  for (let i = 0; i < duplas.length - 1; i += 2) {
    partidas.push(makePartida(`${id}-${i}`, duplas[i], duplas[i + 1]));
  }
  return { id, nome, partidas };
}

function knockoutNome(count) {
  if (count >= 8) return 'Quartas de Final';
  if (count === 4) return 'Semifinal';
  if (count === 2) return 'Final';
  return 'Playoff';
}

function reducer(state, action) {
  switch (action.type) {

    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.config } };

    case 'ADD_JOGADOR': {
      const jogador = { id: `j-${Date.now()}`, nome: action.nome.trim(), genero: action.genero };
      return { ...state, jogadores: [...state.jogadores, jogador] };
    }
    case 'REMOVE_JOGADOR':
      return { ...state, jogadores: state.jogadores.filter(j => j.id !== action.id) };

    case 'CRIAR_DUPLA': {
      const j1 = state.jogadores.find(j => j.id === action.jogador1Id);
      const j2 = state.jogadores.find(j => j.id === action.jogador2Id);
      if (!j1 || !j2) return state;
      const dupla = { id: `dupla-${Date.now()}`, jogadores: [j1, j2] };
      return { ...state, duplas: [...state.duplas, dupla] };
    }
    case 'REMOVER_DUPLA': {
      const { [action.id]: _removed, ...restPreAssign } = (state.preAssign || {});
      return {
        ...state,
        duplas: state.duplas.filter(d => d.id !== action.id),
        preAssign: restPreAssign,
      };
    }

    case 'SET_PRE_ASSIGN': {
      const preAssign = { ...(state.preAssign || {}) };
      if (action.grupoIndex === null) {
        delete preAssign[action.duplaId];
      } else {
        preAssign[action.duplaId] = action.grupoIndex;
      }
      return { ...state, preAssign };
    }

    case 'INICIAR_GRUPOS': {
      const { numGrupos } = state.config;
      const preAssign = state.preAssign || {};
      const allAssigned = state.duplas.every(d => {
        const gi = preAssign[d.id];
        return gi !== undefined && gi >= 0 && gi < numGrupos;
      });

      let grupos;
      if (allAssigned && state.duplas.length > 0) {
        // Use manual group assignments
        const ts = Date.now();
        grupos = Array.from({ length: numGrupos }, (_, i) => ({
          id: `grupo-${i}`,
          nome: `Grupo ${String.fromCharCode(65 + i)}`,
          duplas: state.duplas.filter(d => preAssign[d.id] === i),
          partidas: [],
        }));
        grupos.forEach((grupo, gi) => {
          const d = grupo.duplas;
          for (let i = 0; i < d.length; i++) {
            for (let j = i + 1; j < d.length; j++) {
              grupo.partidas.push(makePartida(`gp-${gi}-${i}-${j}-${ts}`, d[i], d[j]));
            }
          }
        });
      } else {
        // Random distribution
        grupos = buildGroups(state.duplas, numGrupos);
      }
      return { ...state, grupos, fase: 'grupos' };
    }

    case 'UPDATE_SCORE_GRUPO': {
      const { grupoId, matchId, field, value } = action;
      return {
        ...state,
        grupos: state.grupos.map(g =>
          g.id !== grupoId ? g : {
            ...g,
            partidas: g.partidas.map(p =>
              p.id !== matchId ? p : { ...p, [field]: value }
            )
          }
        )
      };
    }

    case 'SET_VENCEDOR_GRUPO': {
      const { grupoId, matchId, vencedorId } = action;
      return {
        ...state,
        grupos: state.grupos.map(g =>
          g.id !== grupoId ? g : {
            ...g,
            partidas: g.partidas.map(p =>
              p.id !== matchId ? p : { ...p, vencedor: vencedorId }
            )
          }
        )
      };
    }

    case 'INICIAR_KNOCKOUT': {
      const qualificados = shuffle(
        state.grupos.flatMap(g => getStandings(g).slice(0, 2).map(s => s.dupla))
      );
      const nome = knockoutNome(qualificados.length);
      const primeiraFase = buildKnockoutFase('ko-0', nome, qualificados);
      return { ...state, knockoutFases: [primeiraFase], fase: 'knockout' };
    }

    case 'UPDATE_SCORE_KNOCKOUT': {
      const { faseId, matchId, field, value } = action;
      return {
        ...state,
        knockoutFases: state.knockoutFases.map(f =>
          f.id !== faseId ? f : {
            ...f,
            partidas: f.partidas.map(p =>
              p.id !== matchId ? p : { ...p, [field]: value }
            )
          }
        )
      };
    }

    case 'SET_VENCEDOR_KNOCKOUT': {
      const { faseId, matchId, vencedorId } = action;
      return {
        ...state,
        knockoutFases: state.knockoutFases.map(f =>
          f.id !== faseId ? f : {
            ...f,
            partidas: f.partidas.map(p =>
              p.id !== matchId ? p : { ...p, vencedor: vencedorId }
            )
          }
        )
      };
    }

    case 'AVANCAR_FASE_KNOCKOUT': {
      const ultimaFase = state.knockoutFases[state.knockoutFases.length - 1];
      const winners = ultimaFase.partidas
        .filter(p => p.vencedor)
        .map(p => p.vencedor === p.dupla1.id ? p.dupla1 : p.dupla2);
      if (winners.length < 2) return state;

      const idx = state.knockoutFases.length;
      const nome = knockoutNome(winners.length);
      const novaFase = buildKnockoutFase(`ko-${idx}`, nome, winners);
      const newFases = [...state.knockoutFases, novaFase];

      // Add 3rd place match when advancing from semis to final
      if (nome === 'Final' && state.config.terceirolugar) {
        const losers = ultimaFase.partidas
          .filter(p => p.vencedor)
          .map(p => p.vencedor === p.dupla1.id ? p.dupla2 : p.dupla1);
        if (losers.length === 2) {
          newFases.push(buildKnockoutFase('ko-terceiro', '3º Lugar', losers));
        }
      }
      return { ...state, knockoutFases: newFases };
    }

    case 'ADD_PATROCINADOR': {
      const p = { id: `pat-${Date.now()}`, nome: action.nome.trim(), logoUrl: action.logoUrl?.trim() || '' };
      return { ...state, patrocinadores: [...state.patrocinadores, p] };
    }
    case 'REMOVE_PATROCINADOR':
      return { ...state, patrocinadores: state.patrocinadores.filter(p => p.id !== action.id) };

    case 'RESETAR':
      return { ...initialState, patrocinadores: state.patrocinadores };

    case 'VOLTAR_INSCRICAO':
      return { ...state, fase: 'inscricao', grupos: [], knockoutFases: [] };

    case 'VOLTAR_GRUPOS':
      return { ...state, fase: 'grupos', knockoutFases: [] };

    case '_SET_STATE':
      return { ...initialState, ...action.state };

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState('');
  const skipNextSave = useRef(true);

  useEffect(() => {
    supabase
      .from(TABLE)
      .select('dados')
      .eq('id', ROW_ID)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('Supabase load error:', error);
        if (!error && data?.dados) {
          dispatch({ type: '_SET_STATE', state: data.dados });
        }
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    supabase
      .from(TABLE)
      .update({ dados: state })
      .eq('id', ROW_ID)
      .then(({ error }) => {
        if (error) {
          console.error('Supabase save error:', error);
          setSaveError(`Erro ao salvar: ${error.message}`);
        } else {
          setSaveError('');
        }
      });
  }, [state, ready]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 flex items-center justify-center">
        <div className="text-white text-lg font-semibold animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {saveError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-sm text-center py-2 px-4">
          ⚠️ {saveError}
        </div>
      )}
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
