import React from 'react';
import { Box, Button, Slider, Typography, styled } from '@mui/material';
import { GameState } from '../../types';

interface GameControlsProps {
  gameState: GameState;
  onBetChange: (amount: number) => void;
  onAction: (action: 'fold' | 'call' | 'raise') => void;
}

const ControlsContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 1000,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  minWidth: 100,
}));

const BetSlider = styled(Slider)(({ theme }) => ({
  width: 200,
  marginRight: theme.spacing(2),
  '& .MuiSlider-thumb': {
    backgroundColor: '#fff',
  },
  '& .MuiSlider-track': {
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiSlider-rail': {
    backgroundColor: theme.palette.grey[500],
  },
}));

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onBetChange,
  onAction,
}) => {
  const [betAmount, setBetAmount] = React.useState(gameState.blinds.big * 2);

  const handleBetChange = (_event: Event, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setBetAmount(newValue);
    onBetChange(newValue);
  };

  return (
    <ControlsContainer>
      <Box display="flex" alignItems="center">
        <Typography variant="body1" sx={{ mr: 2 }}>
          Stack: ${gameState.stack.toFixed(2)}
        </Typography>
        <Typography variant="body1" sx={{ mr: 2 }}>
          Pot: ${gameState.potSize.toFixed(2)}
        </Typography>
        <Typography variant="body1">
          Position: {gameState.position}
        </Typography>
      </Box>

      <Box display="flex" alignItems="center">
        <Typography variant="body2" sx={{ mr: 1 }}>
          Bet: ${betAmount}
        </Typography>
        <BetSlider
          value={betAmount}
          onChange={handleBetChange}
          min={gameState.blinds.big}
          max={gameState.stack}
          step={gameState.blinds.big / 2}
        />
        <ActionButton
          variant="contained"
          color="error"
          onClick={() => onAction('fold')}
        >
          Fold
        </ActionButton>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={() => onAction('call')}
        >
          Call
        </ActionButton>
        <ActionButton
          variant="contained"
          color="success"
          onClick={() => onAction('raise')}
        >
          Raise
        </ActionButton>
      </Box>
    </ControlsContainer>
  );
};

export default GameControls;
