/**
 * CricketDartBoard.tsx
 * Composant de cible pour la variante Cricket du jeu de fléchettes.
 * 
 * Fonctionnement du Cricket :
 * - Seules les zones 15-20 et le bull (25) sont actives
 * - Pour fermer une zone, il faut l'atteindre 3 fois
 * - Les hits sont comptés comme suit :
 *   - Simple = 1 hit
 *   - Double = 2 hits
 *   - Triple = 3 hits (ferme directement la zone)
 * - Points marqués uniquement si la zone n'est pas fermée par tous les joueurs
 * 
 * Structure des données :
 * - gameState: État global de la partie (joueurs, scores, zones fermées)
 * - dartHits: Impacts des fléchettes du tour en cours
 */

import React, { useState } from 'react';
import { CricketGameState, CricketTarget } from '../../types/cricket';

/**
 * Props du composant CricketDartBoard
 */
interface CricketDartBoardProps {
  gameState: CricketGameState;  // État global de la partie
  onScoreClick: (throws: Array<{ target: number; multiplier: number }>) => void;  // Callback pour les scores
  currentPlayerId: string;  // ID du joueur actif
  onTurnComplete: () => void;  // Callback de fin de tour
}

/**
 * Structure d'un impact de fléchette
 */
interface DartHit {
  target: number;      // Numéro de la cible touchée
  multiplier: number;  // Multiplicateur (1-3)
  x: number;          // Position X sur la cible
  y: number;          // Position Y sur la cible
  isMiss?: boolean;   // Si c'est un tir manqué
}

const CricketDartBoard: React.FC<CricketDartBoardProps> = ({
  gameState,
  onScoreClick,
  currentPlayerId,
  onTurnComplete
}) => {
  const [dartHits, setDartHits] = useState<DartHit[]>([]);
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const targets = [15, 16, 17, 18, 19, 20, 25] as CricketTarget[];

  // Les sections de score sur la cible, dans l'ordre horaire en partant du haut (20)
  const sections = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  
  // Dimensions du SVG et de la cible
  const size = window.innerWidth < 640 ? Math.min(window.innerWidth - 32, 300) : 400;
  const center = size / 2;
  const radius = size * 0.50;

  // Rayons des différentes zones
  const doubleRing = radius * 0.88;
  const outerSingle = radius * 0.80;
  const tripleRing = radius * 0.55;
  const innerSingle = radius * 0.45;
  const bullOuter = radius * 0.16;
  const bullInner = radius * 0.08;

  /**
   * Gère un impact de fléchette sur la cible
   * @param target - Numéro de la cible touchée
   * @param multiplier - Multiplicateur (1-3)
   * @param event - Événement de clic
   */
  const handleHit = (target: number, multiplier: number, event: React.MouseEvent<SVGElement>) => {
    if (dartHits.length >= 3) return;

    const svg = event.currentTarget.closest('svg');
    if (!svg) return;

    const svgRect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;

    // Calcul des coordonnées normalisées par rapport au SVG et au viewBox
    const x = ((event.clientX - svgRect.left) / svgRect.width) * viewBox.width;
    const y = ((event.clientY - svgRect.top) / svgRect.height) * viewBox.height;
    
    setDartHits(prev => [...prev, { target, multiplier, x, y }]);
  };

  /**
   * Récupère le statut d'une cible pour le joueur actuel
   * @param target - Numéro de la cible
   * @returns Objet contenant le statut de fermeture et le nombre de hits
   */
  const getTargetStatus = (target: CricketTarget) => {
    if (!currentPlayer?.scores) {
      return { closed: false, hits: 0 };
    }
    
    const score = currentPlayer.scores[target];
    if (!score) {
      return { closed: false, hits: 0 };
    }

    return {
      closed: score.hits >= 3,
      hits: score.hits
    };
  };

  /**
   * Retourne le symbole correspondant au nombre de hits sur une cible
   * / = 1 hit
   * X = 2 hits
   * ● = 3 hits (fermé)
   */
  const getHitSymbol = (hits: number) => {
    if (hits === 0) return '';
    if (hits === 1) return '/';
    if (hits === 2) return 'X';
    return '●';
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

    const paths = [
      // Double ring (x2)
      `M ${center + doubleRing * Math.cos(startRad)} ${center + doubleRing * Math.sin(startRad)}
       A ${doubleRing} ${doubleRing} 0 0 1 ${center + doubleRing * Math.cos(endRad)} ${center + doubleRing * Math.sin(endRad)}
       L ${center + outerSingle * Math.cos(endRad)} ${center + outerSingle * Math.sin(endRad)}
       A ${outerSingle} ${outerSingle} 0 0 0 ${center + outerSingle * Math.cos(startRad)} ${center + outerSingle * Math.sin(startRad)} Z`,
      
      // Outer single (x1)
      `M ${center + outerSingle * Math.cos(startRad)} ${center + outerSingle * Math.sin(startRad)}
       A ${outerSingle} ${outerSingle} 0 0 1 ${center + outerSingle * Math.cos(endRad)} ${center + outerSingle * Math.sin(endRad)}
       L ${center + tripleRing * Math.cos(endRad)} ${center + tripleRing * Math.sin(endRad)}
       A ${tripleRing} ${tripleRing} 0 0 0 ${center + tripleRing * Math.cos(startRad)} ${center + tripleRing * Math.sin(startRad)} Z`,
      
      // Triple ring (x3)
      `M ${center + tripleRing * Math.cos(startRad)} ${center + tripleRing * Math.sin(startRad)}
       A ${tripleRing} ${tripleRing} 0 0 1 ${center + tripleRing * Math.cos(endRad)} ${center + tripleRing * Math.sin(endRad)}
       L ${center + innerSingle * Math.cos(endRad)} ${center + innerSingle * Math.sin(endRad)}
       A ${innerSingle} ${innerSingle} 0 0 0 ${center + innerSingle * Math.cos(startRad)} ${center + innerSingle * Math.sin(startRad)} Z`,
      
      // Inner single (x1)
      `M ${center + innerSingle * Math.cos(startRad)} ${center + innerSingle * Math.sin(startRad)}
       A ${innerSingle} ${innerSingle} 0 0 1 ${center + innerSingle * Math.cos(endRad)} ${center + innerSingle * Math.sin(endRad)}
       L ${center + bullOuter * Math.cos(endRad)} ${center + bullOuter * Math.sin(endRad)}
       A ${bullOuter} ${bullOuter} 0 0 0 ${center + bullOuter * Math.cos(startRad)} ${center + bullOuter * Math.sin(startRad)} Z`
    ];

    const isEvenSection = index % 2 === 0;
    const isCricketTarget = targets.includes(score as CricketTarget);
    const status = isCricketTarget ? getTargetStatus(score as CricketTarget) : undefined;

    const getBaseColor = () => {
      if (!isCricketTarget) return isEvenSection ? "fill-[#1a1a1a]" : "fill-[#000]";
      if (status?.closed) return "fill-green-600/50"; // Plus visible quand fermé
      return "fill-red-600/50"; // Plus visible quand non fermé
    };

    const isHit = (pathIndex: number) => {
      return dartHits.some(hit => 
        hit.target === score && 
        (pathIndex === 0 && hit.multiplier === 2 ||
         (pathIndex === 1 || pathIndex === 3) && hit.multiplier === 1 ||
         pathIndex === 2 && hit.multiplier === 3)
      );
    };

    return (
      <g key={score}>
        {paths.map((path, pathIndex) => (
          <path
            key={pathIndex}
            data-testid={`target-${score}-${pathIndex === 0 ? 'double' : pathIndex === 2 ? 'triple' : 'single'}`}
            d={path}
            className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors hover:brightness-150 hover:opacity-80 ${
              isHit(pathIndex) ? 'fill-[var(--neon-primary)] opacity-70' : getBaseColor()
            } ${!isCricketTarget ? 'opacity-30 cursor-not-allowed' : ''} ${status?.closed ? 'opacity-80' : 'opacity-50'}`}
            onClick={(e) => isCricketTarget && !status?.closed && handleHit(score, pathIndex === 0 ? 2 : pathIndex === 2 ? 3 : 1, e)}
          />
        ))}
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isCricketTarget ? (status?.closed ? "#22c55a" : "white") : "gray"}
          className="font-bold text-sm sm:text-lg"
        >
          {score}
        </text>
        {isCricketTarget && status && (
          <text
            x={center + (radius * 0.35) * Math.cos(textRad)}
            y={center + (radius * 0.35) * Math.sin(textRad)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={status.closed ? "#22c55a" : "white"}
            className="font-bold text-sm sm:text-lg"
          >
            {getHitSymbol(status.hits)}
          </text>
        )}
      </g>
    );
  };

  const handleValidateScore = () => {
    // Collect all valid throws
    const validThrows = dartHits
      .filter(hit => !hit.isMiss)
      .map(hit => ({
        target: hit.target,
        multiplier: hit.multiplier
      }));

    // Send all throws at once
    onScoreClick(validThrows);
    
    // Reset darts
    setDartHits([]);
    onTurnComplete();
  };

  return (
    <div className="relative w-full max-w-md mx-auto mt-8">
      {/* Zone de Miss - grande zone derrière la cible uniquement */}
      <div 
        className={`absolute -top-12 -left-12 -right-12 h-[480px]
          bg-[#1a1a1a] border-2 border-[var(--neon-primary)] border-opacity-20
          backdrop-blur-sm bg-opacity-20 rounded-lg cursor-crosshair
          hover:bg-opacity-30 hover:border-opacity-30 transition-colors duration-200
          ${dartHits.length >= 3 ? 'pointer-events-none !bg-opacity-10 !border-opacity-10' : ''}`}
        onClick={(e) => {
          if (dartHits.length >= 3) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          const newHit = { target: 0, multiplier: 0, x, y, isMiss: true };
          setDartHits([...dartHits, newHit]);
        }}
      >
        <span className="absolute top-2 left-2 text-[var(--text-primary)] text-sm sm:text-base font-medium pointer-events-none">
          Miss
        </span>
        {dartHits.filter(hit => hit.isMiss).map((hit, index) => (
          <div
            key={index}
            className="absolute w-2 h-2 bg-[var(--neon-primary)] rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${hit.x}%`,
              top: `${hit.y}%`,
            }}
          />
        ))}
      </div>

      {/* Container de la cible avec position relative */}
      <div className="relative z-10 w-full aspect-square">
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`} 
          className="transform rotate-9"
        >
          {/* Fond de la cible */}
          <circle cx={center} cy={center} r={radius} className="fill-[#1a1a2e] stroke-[var(--neon-primary)]" strokeWidth="2" />
          
          {/* Lignes de séparation */}
          {sections.map((_, index) => {
            const angle = index * 18 - 99;
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={`line-${index}`}
                x1={center}
                y1={center}
                x2={center + radius * Math.cos(rad)}
                y2={center + radius * Math.sin(rad)}
                className="stroke-[var(--neon-primary)] stroke-[0.5]"
              />
            );
          })}

          {/* Cercles concentriques */}
          <circle cx={center} cy={center} r={doubleRing} className="fill-none stroke-[var(--neon-primary)] stroke-[0.5]" />
          <circle cx={center} cy={center} r={outerSingle} className="fill-none stroke-[var(--neon-primary)] stroke-[0.5]" />
          <circle cx={center} cy={center} r={tripleRing} className="fill-none stroke-[var(--neon-primary)] stroke-[0.5]" />
          <circle cx={center} cy={center} r={innerSingle} className="fill-none stroke-[var(--neon-primary)] stroke-[0.5]" />
          <circle cx={center} cy={center} r={bullOuter} className="fill-none stroke-[var(--neon-primary)] stroke-[0.5]" />
          
          {/* Sections */}
          {sections.map((score, index) => {
            const section = createSection(index, score);
            return (
              <g key={score} data-testid={`target-${score}`}>
                {section}
              </g>
            );
          })}

          {/* Bull's eye */}
          <circle 
            data-testid="bull-outer"
            cx={center} 
            cy={center} 
            r={bullOuter}
            className={`cursor-pointer stroke-[var(--neon-primary)] stroke-2 transition-colors hover:brightness-150 hover:opacity-80
              ${getTargetStatus(25).closed ? 'fill-[#22c55a]/50' : 'fill-[#dc2626]/50'}`}
            onClick={(e) => handleHit(25, 1, e)}
          />
          <circle 
            data-testid="bull-inner"
            cx={center} 
            cy={center} 
            r={bullInner}
            className={`cursor-pointer stroke-[var(--neon-primary)] stroke-2 transition-colors hover:brightness-150 hover:opacity-80
              ${getTargetStatus(25).closed ? 'fill-[#22c55a]/50' : 'fill-[#dc2626]/50'}`}
            onClick={(e) => handleHit(25, 2, e)}
          />

          {/* Score total */}
          <text
            x={center}
            y={center}
            fill="var(--text-primary)"
            className="text-lg sm:text-2xl font-bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {currentPlayer?.totalPoints || 0}
          </text>

          {/* Impacts sur la cible */}
          {dartHits.filter(hit => !hit.isMiss).map((hit, index) => (
            <g key={index}>
              <circle
                cx={hit.x}
                cy={hit.y}
                r={4}
                className="fill-white stroke-black stroke-1"
              />
              <circle
                cx={hit.x}
                cy={hit.y}
                r={6}
                className="fill-none stroke-white stroke-1 opacity-50"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Indicateur de fléchettes avec scores et légende */}
      <div className="mt-2 sm:mt-4 flex justify-center items-start gap-8">
        {/* Fléchettes */}
        <div className="flex gap-2 sm:gap-4">
          {[0, 1, 2].map((index) => {
            const hit = index < dartHits.length ? dartHits[index] : null;
            return (
              <div 
                key={index}
                data-testid={`dart-indicator-${index + 1}`}
                className={`flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 border-gray-700 transition-all duration-300 ${
                  index < dartHits.length ? 'bg-[var(--glass-bg)]' : 'bg-gray-800 opacity-40'
                }`}
              >
                <svg
                  width="20"
                  height="40"
                  viewBox="0 0 512 512"
                  className="transition-all duration-200 w-8 h-8 text-[var(--text-primary)]"
                >
                  <path
                    fill="currentColor"
                    d="M134.745 22.098c-4.538-.146-9.08 1.43-14.893 7.243-5.586 5.586-11.841 21.725-15.248 35.992-.234.979-.444 1.907-.654 2.836l114.254 105.338c-7.18-28.538-17.555-59.985-29.848-86.75-11.673-25.418-25.249-46.657-37.514-57.024-6.132-5.183-11.56-7.488-16.097-7.635zM92.528 82.122L82.124 92.526 243.58 267.651l24.072-24.072L92.528 82.122zm-24.357 21.826c-.929.21-1.857.42-2.836.654-14.267 3.407-30.406 9.662-35.993 15.248-5.813 5.813-7.39 10.355-7.244 14.893.147 4.538 2.452 9.965 7.635 16.098 10.367 12.265 31.608 25.842 57.025 37.515 26.766 12.293 58.211 22.669 86.749 29.848L68.17 103.948zM280.899 255.79l-25.107 25.107 73.265 79.469 31.31-31.31L280.9 255.79zm92.715 85.476l-32.346 32.344 2.07 2.246c.061.058 4.419 4.224 10.585 6.28 6.208 2.069 12.71 2.88 21.902-6.313 9.192-9.192 8.38-15.694 6.31-21.902-2.057-6.174-6.235-10.54-6.283-10.59l-2.238-2.065zm20.172 41.059a46.23 46.23 0 0 1-5.233 6.226 46.241 46.241 0 0 1-6.226 5.235L489.91 489.91l-96.125-107.586z"
                  />
                </svg>
                {/* Score de la fléchette */}
                {hit && (
                  <div className="text-[var(--text-primary)] font-bold text-lg sm:text-2xl mt-1 sm:mt-2 flex flex-col items-center">
                    <span>{hit.target}</span>
                    {hit.multiplier > 1 && (
                      <span className="text-xs sm:text-sm">x{hit.multiplier}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton de validation */}
      <div className="mt-2 mb-8 sm:mt-4 text-center">
        <button
          onClick={handleValidateScore}
          className={`game-button ${dartHits.length < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={dartHits.length < 3}
        >
          Valider le score
        </button>
      </div>

      {/* Légende */}
      <div className="bg-[var(--glass-bg)] w-64 p-4 rounded-lg border border-[var(--neon-primary)]">
        <h3 className="text-[var(--text-primary)] text-sm font-bold mb-2">Légende</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600/50 rounded"></div>
            <span className="text-[var(--text-primary)]">Non fermé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600/50 rounded"></div>
            <span className="text-[var(--text-primary)]">Fermé</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-primary)]">/</span>
            <span className="text-[var(--text-primary)]">1 touche</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-primary)]">X</span>
            <span className="text-[var(--text-primary)]">2 touches</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-primary)]">●</span>
            <span className="text-[var(--text-primary)]">Fermé (3 touches)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CricketDartBoard; 