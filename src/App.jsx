import { useState } from 'react';
import { StoreProvider, useStore } from './store';
import Login from './components/Login';
import Registration from './components/Registration';
import Bracket from './components/Bracket';
import AtletaView from './components/AtletaView';

function AdminApp({ onLogout }) {
  const { state } = useStore();
  return state.fase === 'chave'
    ? <Bracket onLogout={onLogout} />
    : <Registration onLogout={onLogout} />;
}

export default function App() {
  const [papel, setPapel] = useState(null); // null | 'admin' | 'atleta'

  if (!papel) {
    return <Login onLogin={p => setPapel(p)} />;
  }

  if (papel === 'atleta') {
    return <AtletaView onLogout={() => setPapel(null)} />;
  }

  return (
    <StoreProvider>
      <AdminApp onLogout={() => setPapel(null)} />
    </StoreProvider>
  );
}
