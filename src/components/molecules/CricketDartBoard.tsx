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
import { CricketGameState } from '../../types/variants/cricket/types';

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
  const targets = [15, 16, 17, 18, 19, 20, 25];

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
    // Si on a déjà 3 lancers, on réinitialise
    if (dartHits.length >= 3) {
      setDartHits([]);
      return;
    }

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
  const getTargetStatus = (target: number) => {
    if (!currentPlayer) {
      console.log('No current player found');
      return { closed: false, hits: 0 };
    }
    
    const targetKey = target.toString();
    if (!currentPlayer.scores || !currentPlayer.scores[targetKey]) {
      console.log('No scores found for target:', target);
      return { closed: false, hits: 0 };
    }

    const score = currentPlayer.scores[targetKey];
    console.log('Target status for', target, ':', score);
    return {
      closed: score.hits >= 3,
      hits: score.hits || 0
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
    const isCricketTarget = targets.includes(score);
    const status = isCricketTarget ? getTargetStatus(score) : undefined;

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

  const handleMiss = (event: React.MouseEvent<HTMLDivElement>) => {
    // Si on a déjà 3 lancers, on réinitialise
    if (dartHits.length >= 3) {
      setDartHits([]);
      return;
    }
    
    // Calculer la position relative du clic dans la zone miss
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setDartHits(prev => [...prev, { target: 0, multiplier: 1, x, y, isMiss: true }]);
  };

  const handleValidateScore = () => {
    // Si on a 3 lancers
    if (dartHits.length === 3) {
      // Envoyer les lancers tels quels
      const throws = dartHits.map(hit => ({
        target: hit.target,
        multiplier: hit.multiplier
      }));

      // Envoyer les lancers
      onScoreClick(throws);
      
      // Reset darts and complete turn
      setDartHits([]);
      onTurnComplete();
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Zone de Miss - grande zone derrière la cible uniquement */}
      <div 
        className={`absolute -top-12 -left-12 -right-12 h-[480px]
          bg-[#1a1a1a] border-2 border-[var(--neon-primary)] border-opacity-20
          backdrop-blur-sm bg-opacity-20 rounded-lg cursor-crosshair
          hover:bg-opacity-30 hover:border-opacity-30 transition-colors duration-200`}
        onClick={handleMiss}
      >
        {/* Impacts des lancers manqués */}
        {dartHits.filter(hit => hit.isMiss).map((hit, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${hit.x}px`,
              top: `${hit.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute -inset-1 border border-white rounded-full opacity-50"></div>
          </div>
        ))}
      </div>
      
      {/* Affichage des lancers actuels */}
      <div className="absolute -top-8 left-0 bg-black/50 p-2 rounded">
        <div className="text-white">
          Lancers : {dartHits.length}/3
          {dartHits.map((hit, index) => (
            <span key={index} className="ml-2">
              {hit.isMiss ? '✗' : '●'}
            </span>
          ))}
        </div>
      </div>

      {/* Container de la cible avec position relative */}
      <div className="relative z-10 w-full aspect-square flex justify-center">
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
            const dart = dartHits[index];
            return (
              <div
                key={index}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                  ${dart ? 'border-[var(--neon-primary)] text-[var(--neon-primary)]' : 'border-gray-600 text-gray-600'}`}
              >
                {dart ? (dart.isMiss ? '✗' : '●') : index + 1}
              </div>
            );
          })}
        </div>

        {/* Bouton de validation */}
        <button
          onClick={handleValidateScore}
          className={`game-button ${dartHits.length < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={dartHits.length < 3}
        >
          Valider le score
        </button>
      </div>

      {/* Légende */}
      <div className="mt-4 bg-[var(--glass-bg)] w-64 p-4 rounded-lg border border-[var(--neon-primary)]">
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