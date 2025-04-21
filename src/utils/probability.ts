import { Card, ProbabilityCalculation } from '../types';

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['♠', '♥', '♦', '♣'];

export function calculateEquity(
  holeCards: Card[],
  boardCards: Card[],
  opponents: number
): ProbabilityCalculation {
  // Création du deck complet
  const deck = new Set(
    RANKS.flatMap(rank =>
      SUITS.map(suit => ({ rank, suit, id: `${rank}${suit}` }))
    )
  );

  // Retirer les cartes connues
  [...holeCards, ...boardCards].forEach(card => {
    deck.delete(card);
  });

  // Calculer les outs et probabilités
  const remainingCards = Array.from(deck);
  let winningCombinations = 0;
  let totalCombinations = 0;

  // Simulation Monte Carlo pour les grandes combinaisons
  const iterations = 10000;
  for (let i = 0; i < iterations; i++) {
    const simulation = simulateHand(
      holeCards,
      boardCards,
      remainingCards,
      opponents
    );
    if (simulation.isWin) winningCombinations++;
    totalCombinations++;
  }

  const winChance = (winningCombinations / totalCombinations) * 100;
  
  // Calculer les probabilités de différentes mains
  const possibleHands = calculatePossibleHands(holeCards, boardCards, remainingCards);
  
  // Générer des recommandations basées sur les probabilités
  const recommendations = generateRecommendations(winChance, possibleHands);

  return {
    winChance,
    drawChance: calculateDrawChance(holeCards, boardCards, remainingCards),
    possibleHands,
    recommendations
  };
}

function simulateHand(
  holeCards: Card[],
  boardCards: Card[],
  remainingCards: Card[],
  opponents: number
): { isWin: boolean } {
  // Simulation Monte Carlo d'une main complète
  const shuffledCards = [...remainingCards].sort(() => Math.random() - 0.5);
  const neededCards = 5 - boardCards.length;
  const simulatedBoard = [...boardCards, ...shuffledCards.slice(0, neededCards)];
  
  // Simuler les mains des adversaires
  const opponentHands = [];
  for (let i = 0; i < opponents; i++) {
    opponentHands.push(shuffledCards.slice(neededCards + i * 2, neededCards + (i + 1) * 2));
  }

  const heroStrength = evaluateHand([...holeCards, ...simulatedBoard]);
  const opponentStrengths = opponentHands.map(hand => 
    evaluateHand([...hand, ...simulatedBoard])
  );

  return {
    isWin: !opponentStrengths.some(strength => strength > heroStrength)
  };
}

function evaluateHand(cards: Card[]): number {
  // Évaluation précise de la force d'une main
  // Retourne un score numérique représentant la force de la main
  let score = 0;
  
  // Vérifier les combinaisons possibles
  if (hasRoyalFlush(cards)) score = 900 + getHighCardScore(cards);
  else if (hasStraightFlush(cards)) score = 800 + getHighCardScore(cards);
  else if (hasFourOfAKind(cards)) score = 700 + getHighCardScore(cards);
  else if (hasFullHouse(cards)) score = 600 + getHighCardScore(cards);
  else if (hasFlush(cards)) score = 500 + getHighCardScore(cards);
  else if (hasStraight(cards)) score = 400 + getHighCardScore(cards);
  else if (hasThreeOfAKind(cards)) score = 300 + getHighCardScore(cards);
  else if (hasTwoPair(cards)) score = 200 + getHighCardScore(cards);
  else if (hasOnePair(cards)) score = 100 + getHighCardScore(cards);
  else score = getHighCardScore(cards);

  return score;
}

// Fonctions helpers pour l'évaluation des mains
function hasRoyalFlush(cards: Card[]): boolean {
  return hasStraightFlush(cards) && cards.some(card => card.rank === 'A');
}

function hasStraightFlush(cards: Card[]): boolean {
  return hasFlush(cards) && hasStraight(cards);
}

function hasFourOfAKind(cards: Card[]): boolean {
  const ranks = cards.map(card => card.rank);
  return RANKS.some(rank => ranks.filter(r => r === rank).length === 4);
}

function hasFullHouse(cards: Card[]): boolean {
  return hasThreeOfAKind(cards) && hasPair(cards);
}

function hasFlush(cards: Card[]): boolean {
  return SUITS.some(suit => cards.filter(card => card.suit === suit).length >= 5);
}

function hasStraight(cards: Card[]): boolean {
  const ranks = Array.from(new Set(cards.map(card => RANKS.indexOf(card.rank)))).sort((a, b) => a - b);
  return ranks.some((rank, i) => {
    if (i <= ranks.length - 5) {
      return ranks.slice(i, i + 5).every((r, j) => j === 0 || r === ranks[i + j - 1] + 1);
    }
    return false;
  });
}

function hasThreeOfAKind(cards: Card[]): boolean {
  const ranks = cards.map(card => card.rank);
  return RANKS.some(rank => ranks.filter(r => r === rank).length === 3);
}

function hasTwoPair(cards: Card[]): boolean {
  const ranks = cards.map(card => card.rank);
  let pairs = 0;
  RANKS.forEach(rank => {
    if (ranks.filter(r => r === rank).length === 2) pairs++;
  });
  return pairs >= 2;
}

function hasOnePair(cards: Card[]): boolean {
  const ranks = cards.map(card => card.rank);
  return RANKS.some(rank => ranks.filter(r => r === rank).length === 2);
}

function hasPair(cards: Card[]): boolean {
  return hasOnePair(cards);
}

function getHighCardScore(cards: Card[]): number {
  return Math.max(...cards.map(card => RANKS.indexOf(card.rank)));
}

function calculateDrawChance(
  holeCards: Card[],
  boardCards: Card[],
  remainingCards: Card[]
): number {
  // Calculer les chances de compléter une main en cours
  let drawChance = 0;

  if (boardCards.length >= 3) {
    const allCards = [...holeCards, ...boardCards];
    
    // Vérifier les tirages couleur
    const flushDraw = SUITS.some(suit => {
      const suitedCards = allCards.filter(card => card.suit === suit).length;
      return suitedCards === 4;
    });

    // Vérifier les tirages quinte
    const straightDraw = hasStraightDraw(allCards);

    if (flushDraw) drawChance += (remainingCards.length / 47) * 100;
    if (straightDraw) drawChance += (remainingCards.length / 47) * 100;
  }

  return Math.min(drawChance, 100);
}

function hasStraightDraw(cards: Card[]): boolean {
  const ranks = Array.from(new Set(cards.map(card => RANKS.indexOf(card.rank)))).sort((a, b) => a - b);
  return ranks.some((rank, i) => {
    if (i <= ranks.length - 4) {
      return ranks.slice(i, i + 4).every((r, j) => j === 0 || r === ranks[i + j - 1] + 1);
    }
    return false;
  });
}

function calculatePossibleHands(
  holeCards: Card[],
  boardCards: Card[],
  remainingCards: Card[]
): { hand: string; probability: number }[] {
  const possibleHands = [];
  const allCards = [...holeCards, ...boardCards];

  // Calculer les probabilités pour chaque type de main possible
  if (canMakeRoyalFlush(allCards)) {
    possibleHands.push({
      hand: 'Quinte Flush Royale',
      probability: calculateSpecificHandProbability('royal_flush', allCards, remainingCards)
    });
  }

  possibleHands.push(
    {
      hand: 'Quinte Flush',
      probability: calculateSpecificHandProbability('straight_flush', allCards, remainingCards)
    },
    {
      hand: 'Carré',
      probability: calculateSpecificHandProbability('four_of_a_kind', allCards, remainingCards)
    },
    {
      hand: 'Full',
      probability: calculateSpecificHandProbability('full_house', allCards, remainingCards)
    },
    {
      hand: 'Couleur',
      probability: calculateSpecificHandProbability('flush', allCards, remainingCards)
    },
    {
      hand: 'Quinte',
      probability: calculateSpecificHandProbability('straight', allCards, remainingCards)
    },
    {
      hand: 'Brelan',
      probability: calculateSpecificHandProbability('three_of_a_kind', allCards, remainingCards)
    },
    {
      hand: 'Deux Paires',
      probability: calculateSpecificHandProbability('two_pair', allCards, remainingCards)
    },
    {
      hand: 'Paire',
      probability: calculateSpecificHandProbability('one_pair', allCards, remainingCards)
    }
  );

  return possibleHands.filter(hand => hand.probability > 0);
}

function canMakeRoyalFlush(cards: Card[]): boolean {
  return SUITS.some(suit => {
    const suitedCards = cards.filter(card => card.suit === suit);
    return suitedCards.some(card => card.rank === 'A') &&
           suitedCards.some(card => ['K', 'Q', 'J', '10'].includes(card.rank));
  });
}

function calculateSpecificHandProbability(
  handType: string,
  currentCards: Card[],
  remainingCards: Card[]
): number {
  // Calculer la probabilité spécifique pour chaque type de main
  const iterations = 1000;
  let successes = 0;

  for (let i = 0; i < iterations; i++) {
    const shuffledCards = [...remainingCards].sort(() => Math.random() - 0.5);
    const neededCards = 5 - currentCards.length;
    const simulatedHand = [...currentCards, ...shuffledCards.slice(0, neededCards)];

    switch (handType) {
      case 'royal_flush':
        if (hasRoyalFlush(simulatedHand)) successes++;
        break;
      case 'straight_flush':
        if (hasStraightFlush(simulatedHand)) successes++;
        break;
      case 'four_of_a_kind':
        if (hasFourOfAKind(simulatedHand)) successes++;
        break;
      case 'full_house':
        if (hasFullHouse(simulatedHand)) successes++;
        break;
      case 'flush':
        if (hasFlush(simulatedHand)) successes++;
        break;
      case 'straight':
        if (hasStraight(simulatedHand)) successes++;
        break;
      case 'three_of_a_kind':
        if (hasThreeOfAKind(simulatedHand)) successes++;
        break;
      case 'two_pair':
        if (hasTwoPair(simulatedHand)) successes++;
        break;
      case 'one_pair':
        if (hasOnePair(simulatedHand)) successes++;
        break;
    }
  }

  return (successes / iterations) * 100;
}

function generateRecommendations(
  winChance: number,
  possibleHands: { hand: string; probability: number }[]
): { action: string; confidence: number; reasoning: string }[] {
  const recommendations = [];

  // Recommandations basées sur la probabilité de gagner
  if (winChance > 80) {
    recommendations.push({
      action: 'Raise',
      confidence: 90,
      reasoning: 'Main très forte avec une excellente chance de gagner'
    });
  } else if (winChance > 60) {
    recommendations.push({
      action: 'Call/Raise',
      confidence: 75,
      reasoning: 'Main forte avec une bonne chance de gagner'
    });
  } else if (winChance > 40) {
    recommendations.push({
      action: 'Call',
      confidence: 60,
      reasoning: 'Main moyenne avec des chances raisonnables'
    });
  } else {
    recommendations.push({
      action: 'Fold',
      confidence: 80,
      reasoning: 'Main faible avec peu de chances d\'amélioration'
    });
  }

  // Recommandations basées sur les tirages possibles
  const drawHands = possibleHands.filter(hand => hand.probability > 15);
  if (drawHands.length > 0) {
    recommendations.push({
      action: 'Call',
      confidence: 65,
      reasoning: `Tirage possible vers ${drawHands.map(h => h.hand).join(', ')}`
    });
  }

  return recommendations;
}
