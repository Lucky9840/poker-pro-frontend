import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GameRoom from './pages/GameRoom.tsx';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<GameRoom />} />
    </Routes>
  );
};

export default App;
