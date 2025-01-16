import React, { useState, useCallback } from 'react';
import type { AroundTheClockThrow } from '../../types/aroundTheClock';

interface Props {
  currentNumber: number;
  onScoreClick: (throws: AroundTheClockThrow[]) => Promise<void>;
  onTurnComplete?: () => void;
}

interface DartHit {
  x: number;
  y: number;
  isHit: boolean;
  number: number;
}

const AroundTheClockDartBoard: React.FC<Props> = ({
  currentNumber,
  onScoreClick,
  onTurnComplete
}) => {
  const [throwsInTurn, setThrowsInTurn] = useState<AroundTheClockThrow[]>([]);
  const [dartHits, setDartHits] = useState<DartHit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validatedNumbers, setValidatedNumbers] = useState<Set<number>>(new Set());

  // Configuration de la cible
  const boardRadius = 200;
  const centerX = boardRadius;
  const centerY = boardRadius;
  const numberRadius = boardRadius * 0.85; // Position des numéros

  // Ordre des numéros sur une cible standard
  const dartboardNumbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

  // Trouver le prochain numéro à activer (le plus petit non validé)
  const getNextActivatableNumber = useCallback(() => {
    for (let i = 1; i <= 20; i++) {
      if (!validatedNumbers.has(i)) {
        return i;
      }
    }
    return null;
  }, [validatedNumbers]);

  const handleNumberClick = useCallback((number: number, event: React.MouseEvent<SVGElement>) => {
    if (throwsInTurn.length >= 3 || isSubmitting) return;

    const svg = event.currentTarget.closest('svg');
    if (!svg) return;

    const svgRect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    
    const x = ((event.clientX - svgRect.left) / svgRect.width) * viewBox.width;
    const y = ((event.clientY - svgRect.top) / svgRect.height) * viewBox.height;

    // Une fléchette est toujours considérée comme un hit si elle touche une zone
    const newThrow: AroundTheClockThrow = {
      number,
      isHit: true,
      timestamp: Date.now()
    };

    const newHit: DartHit = {
      x,
      y,
      isHit: true,
      number
    };

    setThrowsInTurn(prev => [...prev, newThrow]);
    setDartHits(prev => [...prev, newHit]);
    setValidatedNumbers(prev => new Set([...prev, number]));
  }, [throwsInTurn, isSubmitting]);

  const handleValidateScore = useCallback(async () => {
    if (throwsInTurn.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onScoreClick(throwsInTurn);
      setThrowsInTurn([]);
      setDartHits([]);
      onTurnComplete?.();
    } catch (error) {
      console.error('Error submitting throws:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [throwsInTurn, onScoreClick, onTurnComplete, isSubmitting]);

  // Calculer la position des numéros autour de la cible
  const getNumberPosition = (number: number) => {
    const index = dartboardNumbers.indexOf(number);
    const angle = (index * 18) * (Math.PI / 180); // 360° / 20 = 18° par section
    return {
      x: centerX + numberRadius * Math.sin(angle),
      y: centerY - numberRadius * Math.cos(angle)
    };
  };

  // Générer les sections de la cible
  const generateSections = () => {
    const sections: JSX.Element[] = [];
    const nextNumber = getNextActivatableNumber();

    dartboardNumbers.forEach((number, index) => {
      const isValidated = validatedNumbers.has(number);
      const isNext = number === nextNumber;
      const isHit = throwsInTurn.some(t => t.number === number);
      const angle = index * 18 * (Math.PI / 180);
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
        <g key={number}>
          <path
            d={path}
            onClick={(e) => handleNumberClick(number, e)}
            className={`
              cursor-pointer transition-all duration-200
              ${isValidated ? 'fill-green-500/30 stroke-green-500 stroke-2' : 
                isNext ? 'fill-[var(--neon-primary)] stroke-[var(--neon-primary)] stroke-2 animate-pulse' :
                'fill-[var(--glass-bg-lighter)] stroke-[var(--text-primary)] stroke-1'}
              ${isHit ? 'stroke-green-500 stroke-2' : ''}
              hover:brightness-110
              ${isSubmitting || throwsInTurn.length >= 3 ? 'cursor-not-allowed opacity-50' : ''}
            `}
          />
          <text
            x={getNumberPosition(number).x}
            y={getNumberPosition(number).y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-sm font-bold fill-current ${
              isValidated ? 'text-green-500' :
              isNext ? 'text-[var(--neon-primary)]' :
              'text-[var(--text-primary)]'
            }`}
            transform={`rotate(${index * 18}, ${getNumberPosition(number).x}, ${getNumberPosition(number).y})`}
          >
            {number}
          </text>
        </g>
      );
    });

    return sections;
  };

  // Affichage des impacts
  const renderHits = () => {
    return dartHits.map((hit, index) => (
      <g key={index}>
        {/* Impact central */}
        <circle
          cx={hit.x}
          cy={hit.y}
          r={4}
          className="fill-green-500 stroke-white stroke-1"
        />
        {/* Halo extérieur */}
        <circle
          cx={hit.x}
          cy={hit.y}
          r={6}
          className="fill-none stroke-green-500 stroke-1 opacity-50"
        />
      </g>
    ));
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Cible de fléchettes */}
      <div className="relative">
        <svg
          width={boardRadius * 2}
          height={boardRadius * 2}
          viewBox={`0 0 ${boardRadius * 2} ${boardRadius * 2}`}
          className={isSubmitting || throwsInTurn.length >= 3 ? 'cursor-not-allowed' : ''}
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
          {/* Impacts de fléchettes */}
          {renderHits()}
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
          onClick={handleValidateScore}
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