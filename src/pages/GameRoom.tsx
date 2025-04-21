import React from 'react';

const GameRoom: React.FC = () => {
  return (
    <div className="container">
      <h1>Poker Game Room</h1>
      <div className="card">
        <h2>Game Information</h2>
        <p>Welcome to the poker game room! The game will start soon.</p>
        
        <div className="mt-4">
          <h3>Players</h3>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Chips</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Player 1</td>
                <td>1000</td>
                <td>Ready</td>
              </tr>
              <tr>
                <td>Player 2</td>
                <td>1000</td>
                <td>Waiting</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <button className="button">Start Game</button>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
