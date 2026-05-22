import { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { supabase, TABLE, ROW_ID } from './supabase';

export const initialState = {
  jogadores: [],
  duplas: [],
  rodadas: [],
  fase: 'inscricao',
  patrocinadores: [],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildBracket(duplas) {
  const shuffled = shuffle(duplas);
  const partidas = [];
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    partidas.push({
      id: `m-${Date.now()}-${i}`,
      dupla1: shuffled[i],
      dupla2: shuffled[i + 1],
      score1: '',
      score2: '',
      vencedor: null,
    });
  }
  if (shuffled.length % 2 !== 0) {
    partidas.push({
      id: `m-${Date.now()}-bye`,
      dupla1: shuffled[shuffled.length - 1],
      dupla2: null,
      score1: '',
      score2: '',
      vencedor: shuffled[shuffled.length - 1].id,
    });
  }
  return partidas;
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_JOGADOR': {
      const jogador = { id: `j-${Date.now()}`, nome: action.nome.trim(), genero: action.genero };
      return { ...state, jogadores: [...state.jogadores, jogador] };
    }
    case 'REMOVE_JOGADOR':
      return { ...state, jogadores: state.jogadores.filter(j => j.id !== action.id) };
    case 'CRIAR_DUPLA': {
      const homem = state.jogadores.find(j => j.id === action.homemId);
      const mulher = state.jogadores.find(j => j.id === action.mulherId);
      if (!homem || !mulher) return state;
      const dupla = { id: `dupla-${Date.now()}`, jogadores: [homem, mulher] };
      return { ...state, duplas: [...state.duplas, dupla] };
    }
    case 'REMOVER_DUPLA':
      return { ...state, duplas: state.duplas.filter(d => d.id !== action.id) };
    case 'INICIAR_TORNEIO': {
      const primeiraRodada = buildBracket(state.duplas.filter(d => !d.bye));
      return { ...state, rodadas: [primeiraRodada], fase: 'chave' };
    }
    case 'UPDATE_SCORE': {
      const { rodadaIndex, matchId, field, value } = action;
      const rodadas = state.rodadas.map((rodada, ri) =>
        ri !== rodadaIndex ? rodada : rodada.map(p => p.id !== matchId ? p : { ...p, [field]: value })
      );
      return { ...state, rodadas };
    }
    case 'SET_VENCEDOR': {
      const { rodadaIndex, matchId, vencedorId } = action;
      const rodadas = state.rodadas.map((rodada, ri) =>
        ri !== rodadaIndex ? rodada : rodada.map(p => p.id !== matchId ? p : { ...p, vencedor: vencedorId })
      );
      return { ...state, rodadas };
    }
    case 'AVANCAR_RODADA': {
      const ultimaRodada = state.rodadas[state.rodadas.length - 1];
      const vencedores = ultimaRodada
        .filter(m => m.vencedor)
        .map(m => ultimaRodada.flatMap(m2 => [m2.dupla1, m2.dupla2]).find(d => d && d.id === m.vencedor))
        .filter(Boolean);
      if (vencedores.length < 2) return state;
      return { ...state, rodadas: [...state.rodadas, buildBracket(vencedores)] };
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
      return { ...state, fase: 'inscricao', rodadas: [] };
    case '_SET_STATE':
      return action.state;
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState('');
  const skipNextSave = useRef(true); // skip first save (right after load)

  // Load initial state from Supabase
  useEffect(() => {
    supabase
      .from(TABLE)
      .select('dados')
      .eq('id', ROW_ID)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('Supabase load error:', error);
        if (!error && data?.dados) {
          dispatch({ type: '_SET_STATE', state: { ...initialState, ...data.dados } });
        }
        setReady(true);
      });
  }, []);

  // Save to Supabase whenever state changes (after initial load)
  useEffect(() => {
    if (!ready) return;

    // Skip the automatic save triggered right when ready becomes true
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
