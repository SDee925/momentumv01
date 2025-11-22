import React from 'react';
import { MomentumProvider } from './context/MomentumContext';
import Layout from './components/Layout';

function App() {
  return (
    <MomentumProvider>
      <Layout />
    </MomentumProvider>
  );
}

export default App;
