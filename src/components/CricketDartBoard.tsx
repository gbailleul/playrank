import React, { useState } from 'react';

interface CricketThrow {
  target: number;
  multiplier: number;
}

interface CricketDartBoardProps {
  onScoreClick: (throws: CricketThrow[]) => void;
}

const CricketDartBoard: React.FC<CricketDartBoardProps> = ({ onScoreClick }) => {
  const [darts, setDarts] = useState<CricketThrow[]>(Array(3).fill({ target: 0, multiplier: 0 }));
  const [currentDartIndex, setCurrentDartIndex] = useState<number>(0);

  const handleHit = (target: number, multiplier: number) => {
    console.log('=== CricketDartBoard - Nouveau lancer ===');
    console.log('Cible:', target, 'Multiplicateur:', multiplier);
    
    if (currentDartIndex >= 3) {
      console.log('Maximum de lancers atteint');
      return;
    }

    const newDarts = [...darts];
    newDarts[currentDartIndex] = { target, multiplier };
    console.log('Nouveau tableau de lancers:', newDarts);
    
    setDarts(newDarts);
    setCurrentDartIndex(currentDartIndex + 1);
  };

  const handleValidateScore = () => {
    console.log('=== CricketDartBoard - Validation des scores ===');
    console.log('Lancers à valider:', darts);
    
    const validThrows = darts.filter((dart: CricketThrow) => dart.target !== 0);
    console.log('Lancers valides:', validThrows);
    
    if (validThrows.length > 0) {
      onScoreClick(validThrows);
      console.log('Scores envoyés au GameSession');
    }

    // Reset
    setDarts(Array(3).fill({ target: 0, multiplier: 0 }));
    setCurrentDartIndex(0);
    console.log('Reset effectué');
  };

  return (
    <div>
      {/* Existing JSX content */}
    </div>
  );
}; 