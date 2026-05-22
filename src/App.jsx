import { useState } from 'react';
import { StoreProvider, useStore } from './store';
import Login from './components/Login';
import Registration from './components/Registration';
import GruposAdmin from './components/GruposAdmin';
import KnockoutAdmin from './components/KnockoutAdmin';
import AtletaView from './components/AtletaView';

function AdminApp({ onLogout }) {
  const { state } = useStore();
  if (state.fase === 'grupos')   return <GruposAdmin   onLogout={onLogout} />;
  if (state.fase === 'knockout') return <KnockoutAdmin onLogout={onLogout} />;
  return <Registration onLogout={onLogout} />;
}

export default function App() {
  const [papel, setPapel] = useState(null);

  if (!papel) return <Login onLogin={p => setPapel(p)} />;
  if (papel === 'atleta') return <AtletaView onLogout={() => setPapel(null)} />;

  return (
    <StoreProvider>
      <AdminApp onLogout={() => setPapel(null)} />
    </StoreProvider>
  );
}
