import React, { useState, useCallback } from 'react';
import type { AroundTheClockThrow } from '../../types/aroundTheClock';

interface Props {
  currentNumber: number;
  onScoreClick: (throws: AroundTheClockThrow[]) => void;
  onTurnComplete?: () => void;
}

const AroundTheClockDartBoard: React.FC<Props> = ({
  currentNumber,
  onScoreClick,
  onTurnComplete
}) => {
  const [throwsInTurn, setThrowsInTurn] = useState<AroundTheClockThrow[]>([]);

  // Configuration de la cible
  const boardRadius = 200;
  const centerX = boardRadius;
  const centerY = boardRadius;
  const numberRadius = boardRadius * 0.85; // Position des numéros

  // Calculer la position des fléchettes dans une section
  const getDartPosition = (number: number, throwIndex: number) => {
    const angle = ((number - 20) * 18) * (Math.PI / 180); // Commencer à 20 en haut
    const radius = boardRadius * (0.3 + throwIndex * 0.2); // Espacer les fléchettes radialement
    return {
      x: centerX + radius * Math.sin(angle),
      y: centerY - radius * Math.cos(angle)
    };
  };

  const handleNumberClick = useCallback((number: number, clickX: number, clickY: number) => {
    if (throwsInTurn.length >= 3) return;

    const newThrow: AroundTheClockThrow = {
      number,
      isHit: number === currentNumber,
      timestamp: Date.now()
    };

    const updatedThrows = [...throwsInTurn, newThrow];
    setThrowsInTurn(updatedThrows);

    if (updatedThrows.length === 3) {
      onScoreClick(updatedThrows);
      setThrowsInTurn([]);
      onTurnComplete?.();
    }
  }, [throwsInTurn, currentNumber, onScoreClick, onTurnComplete]);

  const handleEndTurn = useCallback(() => {
    if (throwsInTurn.length > 0) {
      onScoreClick(throwsInTurn);
      setThrowsInTurn([]);
      onTurnComplete?.();
    }
  }, [throwsInTurn, onScoreClick, onTurnComplete]);

  // Calculer la position des numéros autour de la cible
  const getNumberPosition = (number: number) => {
    const angle = ((number - 20) * 18) * (Math.PI / 180); // Commencer à 20 en haut
    return {
      x: centerX + numberRadius * Math.sin(angle),
      y: centerY - numberRadius * Math.cos(angle)
    };
  };

  // Générer les sections de la cible
  const generateSections = () => {
    const sections = [];
    for (let i = 1; i <= 20; i++) {
      const isTarget = i === currentNumber;
      const isHit = throwsInTurn.some(t => t.number === i && t.isHit);
      const angle = ((i - 20) * 18) * (Math.PI / 180);
      const startAngle = angle - (9 * Math.PI / 180);
      const endAngle = angle + (9 * Math.PI / 180);

      // Créer le chemin SVG pour la section
      const path = [
        'M', centerX, centerY,
        'L', 
        centerX + boardRadius * Math.sin(startAngle),
        centerY - boardRadius * Math.cos(startAngle),
        'A', boardRadius, boardRadius, 0, 0, 1,
        centerX + boardRadius * Math.sin(endAngle),
        centerY - boardRadius * Math.cos(endAngle),
        'Z'
      ].join(' ');

      sections.push(
        <g key={i}>
          <path
            d={path}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              handleNumberClick(i, x, y);
            }}
            className={`
              cursor-pointer transition-all duration-200
              ${isTarget ? 'fill-[var(--neon-primary)]' : 'fill-[var(--glass-bg-lighter)]'}
              ${isHit ? 'stroke-green-500 stroke-2' : 'stroke-[var(--text-primary)] stroke-1'}
              hover:brightness-110
            `}
          />
          <text
            x={getNumberPosition(i).x}
            y={getNumberPosition(i).y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-bold fill-current text-[var(--text-primary)]"
            transform={`rotate(${(i - 20) * 18}, ${getNumberPosition(i).x}, ${getNumberPosition(i).y})`}
          >
            {i}
          </text>
          {/* Afficher les fléchettes pour cette section */}
          {throwsInTurn.map((t, index) => {
            if (t.number === i) {
              const pos = getDartPosition(i, index);
              return (
                <g key={`dart-${index}`} transform={`translate(${pos.x}, ${pos.y})`}>
                  {/* Corps de la fléchette */}
                  <path
                    d="M-2,0 L2,0 M0,-8 L0,8 M-4,-6 L4,-6"
                    className={`stroke-2 ${t.isHit ? 'stroke-green-500' : 'stroke-red-500'}`}
                    strokeLinecap="round"
                  />
                  {/* Empennage */}
                  <path
                    d="M-3,-7 L0,-4 L3,-7"
                    className={`fill-none stroke-2 ${t.isHit ? 'stroke-green-500' : 'stroke-red-500'}`}
                    strokeLinecap="round"
                  />
                </g>
              );
            }
            return null;
          })}
        </g>
      );
    }
    return sections;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Cible de fléchettes */}
      <div className="relative">
        <svg
          width={boardRadius * 2}
          height={boardRadius * 2}
          viewBox={`0 0 ${boardRadius * 2} ${boardRadius * 2}`}
        >
          {/* Cercle extérieur */}
          <circle
            cx={centerX}
            cy={centerY}
            r={boardRadius}
            className="fill-[var(--glass-bg)] stroke-[var(--text-primary)] stroke-2"
          />
          {/* Sections de la cible */}
          {generateSections()}
          {/* Double Bull */}
          <circle
            cx={centerX}
            cy={centerY}
            r={boardRadius * 0.08}
            className="fill-[var(--glass-bg-lighter)] stroke-[var(--text-primary)] stroke-1"
          />
          {/* Bull's eye */}
          <circle
            cx={centerX}
            cy={centerY}
            r={boardRadius * 0.04}
            className="fill-red-500"
          />
        </svg>
      </div>

      {/* Affichage des lancers restants */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {[...Array(3 - throwsInTurn.length)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-dashed border-[var(--text-primary)]/30"
            />
          ))}
        </div>

        <button
          onClick={handleEndTurn}
          disabled={throwsInTurn.length === 0}
          className="
            px-6 py-2 rounded-lg bg-[var(--neon-primary)] text-black font-bold
            hover:bg-[var(--neon-primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--neon-primary)]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Terminer le tour
        </button>
      </div>
    </div>
  );
};

export default AroundTheClockDartBoard; 