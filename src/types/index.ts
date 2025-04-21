export interface Card {
  rank: string;
  suit: string;
  id: string;
}

export interface Hand {
  id: string;
  holeCards: Card[];
  boardCards: Card[];
  position: string;
  action: string;
  result: string;
  amount: number;
  gameType: string;
  createdAt: string;
}

export interface Stats {
  totalHands: number;
  winRate: number;
  bbPer100: number;
  vpip: number;
  pfr: number;
  af: number;
  positions: {
    [key: string]: {
      hands: number;
      winRate: number;
      profit: number;
    };
  };
}

export interface GameState {
  selectedCards: Card[];
  communityCards: Card[];
  position: string;
  potSize: number;
  stack: number;
  gameType: 'cash' | 'tournament';
  blinds: {
    small: number;
    big: number;
  };
}

export interface ProbabilityCalculation {
  winChance: number;
  drawChance: number;
  possibleHands: {
    hand: string;
    probability: number;
  }[];
  recommendations: {
    action: string;
    confidence: number;
    reasoning: string;
  }[];
}
