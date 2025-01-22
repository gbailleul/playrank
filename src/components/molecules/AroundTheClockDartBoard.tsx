import React, { useState, useCallback } from 'react';
import type { AroundTheClockThrow } from '../../types/variants/aroundTheClock/types';

interface Props {
  currentNumber: number;
  playerId: string;
  onScoreClick: (throws: AroundTheClockThrow[]) => Promise<void>;
  onTurnComplete?: () => void;
  validatedNumbers: number[];
}

interface DartHit {
  x: number;
  y: number;
  isHit: boolean;
  number: number;
}

const AroundTheClockDartBoard: React.FC<Props> = ({
  currentNumber,
  playerId,
  onScoreClick,
  onTurnComplete,
  validatedNumbers = []
}) => {
  const [throwsInTurn, setThrowsInTurn] = useState<AroundTheClockThrow[]>([]);
  const [dartHits, setDartHits] = useState<DartHit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuration de la cible
  const size = window.innerWidth < 640 ? Math.min(window.innerWidth - 32, 300) : 400;
  const center = size / 2;
  const radius = size * 0.50;

  // Ordre des numéros sur une cible standard
  const dartboardNumbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

  const handleNumberClick = useCallback((number: number, event: React.MouseEvent<SVGElement>) => {
    if (throwsInTurn.length >= 3 || isSubmitting) return;

    const svg = event.currentTarget.closest('svg');
    if (!svg) return;

    const svgRect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    
    const x = ((event.clientX - svgRect.left) / svgRect.width) * viewBox.width;
    const y = ((event.clientY - svgRect.top) / svgRect.height) * viewBox.height;

    // Vérifier si on peut valider ce numéro
    // Pour Around the Clock, on peut valider le numéro actuel ou les suivants si on a déjà validé les précédents
    const validatedInTurn = throwsInTurn
      .filter(t => t.isHit)
      .map(t => t.number)
      .sort((a, b) => a - b);

    let nextValidNumber = currentNumber;
    if (validatedInTurn.length > 0) {
      const lastValidated = Math.max(...validatedInTurn);
      nextValidNumber = lastValidated + 1;
    }

    const isHit = number === nextValidNumber;

    const newThrow: AroundTheClockThrow = {
      number,
      isHit,
      timestamp: Date.now(),
      playerId
    };

    const newHit: DartHit = {
      x,
      y,
      isHit,
      number
    };

    setThrowsInTurn(prev => [...prev, newThrow]);
    setDartHits(prev => [...prev, newHit]);
  }, [throwsInTurn, isSubmitting, currentNumber, playerId]);

  const handleSubmit = async () => {
    if (throwsInTurn.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onScoreClick(throwsInTurn);
      setThrowsInTurn([]);
      setDartHits([]);
      onTurnComplete?.();
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createSection = (index: number, score: number) => {
    const angle = 18;
    const startAngle = index * angle - 99;
    const endAngle = startAngle + angle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const textRadius = radius * 0.94;
    const textAngle = (startAngle + endAngle) / 2;
    const textRad = (textAngle * Math.PI) / 180;
    const textX = center + textRadius * Math.cos(textRad);
    const textY = center + textRadius * Math.sin(textRad);

    const isEvenSection = index % 2 === 0;
    const validatedInTurn = throwsInTurn
      .filter(t => t.isHit)
      .map(t => t.number)
      .sort((a, b) => a - b);

    let nextValidNumber = currentNumber;
    if (validatedInTurn.length > 0) {
      const lastValidated = Math.max(...validatedInTurn);
      nextValidNumber = lastValidated + 1;
    }

    const isCurrent = score === nextValidNumber;
    const isValidated = validatedNumbers.includes(score) || validatedInTurn.includes(score);
    const isHit = dartHits.some(hit => hit.number === score && hit.isHit);

    const path = `M ${center} ${center}
      L ${center + radius * Math.cos(startRad)} ${center + radius * Math.sin(startRad)}
      A ${radius} ${radius} 0 0 1 ${center + radius * Math.cos(endRad)} ${center + radius * Math.sin(endRad)}
      Z`;

    return (
      <g key={score}>
        <path
          d={path}
          onClick={(e) => handleNumberClick(score, e)}
          className={`
            cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors hover:brightness-150 hover:opacity-80
            ${isValidated ? 'fill-green-500/30 stroke-green-500 stroke-2' :
              isHit ? 'fill-[var(--neon-primary)] opacity-70' : 
              isCurrent ? 'fill-[var(--neon-primary)]/20 stroke-[var(--neon-primary)] stroke-2 animate-pulse' :
              isEvenSection ? "fill-[#1a1a1a]" : "fill-[#000]"}
            ${isSubmitting || throwsInTurn.length >= 3 ? 'cursor-not-allowed opacity-50' : ''}
          `}
        />
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-sm font-bold fill-current ${
            isValidated ? 'text-green-500' :
            isCurrent ? 'text-[var(--neon-primary)]' : 'text-[var(--text-primary)]'
          }`}
          transform={`rotate(${(startAngle + endAngle) / 2}, ${textX}, ${textY})`}
        >
          {score}
        </text>
      </g>
    );
  };

  const renderHits = () => {
    return dartHits.map((hit, index) => (
      <g key={index}>
        <circle
          cx={hit.x}
          cy={hit.y}
          r={4}
          className={`${hit.isHit ? 'fill-[var(--neon-primary)]' : 'fill-red-500'} stroke-white stroke-1`}
        />
        <circle
          cx={hit.x}
          cy={hit.y}
          r={6}
          className={`fill-none ${hit.isHit ? 'stroke-[var(--neon-primary)]' : 'stroke-red-500'} stroke-1 opacity-50`}
        />
      </g>
    ));
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={isSubmitting || throwsInTurn.length >= 3 ? 'cursor-not-allowed' : ''}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="fill-[var(--glass-bg)] stroke-[var(--text-primary)] stroke-2"
          />
          {dartboardNumbers.map((number, index) => createSection(index, number))}
          {renderHits()}
        </svg>
      </div>

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
          onClick={handleSubmit}
          disabled={throwsInTurn.length === 0 || isSubmitting}
          className="
            px-6 py-2 rounded-lg bg-[var(--neon-primary)] text-black font-bold
            hover:bg-[var(--neon-primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--neon-primary)]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSubmitting ? 'Envoi en cours...' : 'Valider le score'}
        </button>
      </div>
    </div>
  );
};

export default AroundTheClockDartBoard; 