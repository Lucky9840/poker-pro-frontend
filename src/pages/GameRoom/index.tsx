import React, { useState } from 'react';
import { Box, Container, ThemeProvider, createTheme } from '@mui/material';
import PokerTable3D from '../../components/PokerTable3D';
import CardDeck3D from '../../components/CardDeck3D';
import GameControls from '../../components/GameControls';
import { Card, GameState } from '../../types';
import { calculateEquity } from '../../utils/probability';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const initialGameState: GameState = {
  selectedCards: [],
  communityCards: [],
  position: 'BTN',
  potSize: 0,
  stack: 1000,
  gameType: 'cash',
  blinds: {
    small: 0.5,
    big: 1,
  },
};

export const GameRoom: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [probabilities, setProbabilities] = useState<any>(null);

  const handleCardSelect = (card: Card) => {
    if (gameState.selectedCards.length < 2) {
      const newSelectedCards = [...gameState.selectedCards, card];
      const newGameState = {
        ...gameState,
        selectedCards: newSelectedCards,
      };
      setGameState(newGameState);
      updateProbabilities(newSelectedCards, gameState.communityCards);
    }
  };

  const handleCommunityCardSelect = (card: Card) => {
    if (gameState.communityCards.length < 5) {
      const newCommunityCards = [...gameState.communityCards, card];
      const newGameState = {
        ...gameState,
        communityCards: newCommunityCards,
      };
      setGameState(newGameState);
      updateProbabilities(gameState.selectedCards, newCommunityCards);
    }
  };

  const updateProbabilities = (selectedCards: Card[], communityCards: Card[]) => {
    if (selectedCards.length === 2) {
      const probs = calculateEquity(selectedCards, communityCards, 2);
      setProbabilities(probs);
    }
  };

  const handleBetChange = (amount: number) => {
    setGameState({
      ...gameState,
      potSize: gameState.potSize + amount,
      stack: gameState.stack - amount,
    });
  };

  const handleAction = (action: 'fold' | 'call' | 'raise') => {
    switch (action) {
      case 'fold':
        setGameState(initialGameState);
        break;
      case 'call':
        // Logique pour le call
        break;
      case 'raise':
        // Logique pour le raise
        break;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          position: 'relative',
        }}
      >
        <Container maxWidth={false} disableGutters>
          <Box height="100vh">
            <PokerTable3D
              gameState={gameState}
              onCardClick={() => {}}
              onPositionClick={() => {}}
            />
          </Box>

          <Box
            position="fixed"
            top={20}
            right={20}
            width={300}
            bgcolor="background.paper"
            borderRadius={2}
            p={2}
          >
            <CardDeck3D onCardSelect={handleCardSelect} />
          </Box>

          {probabilities && (
            <Box
              position="fixed"
              top={20}
              left={20}
              width={300}
              bgcolor="background.paper"
              borderRadius={2}
              p={2}
            >
              <pre>{JSON.stringify(probabilities, null, 2)}</pre>
            </Box>
          )}

          <GameControls
            gameState={gameState}
            onBetChange={handleBetChange}
            onAction={handleAction}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default GameRoom;
