import React, { useState } from 'react';

/**
 * Props pour le composant DartBoard
 * @param onScoreSelect Callback appelé quand un score est sélectionné, avec le score et son multiplicateur
 */
interface DartBoardProps {
  onScoreSelect: (score: number, multiplier: number) => void;
}

interface DartHit {
  score: number;
  multiplier: number;
  x: number;
  y: number;
}

/**
 * Composant DartBoard - Affiche une cible de fléchettes interactive
 * 
 * Structure de la cible :
 * - Cercle extérieur : zone de score double (multiplicateur x2)
 * - Zone principale : score simple (multiplicateur x1)
 * - Anneau intérieur : zone triple (multiplicateur x3)
 * - Centre : bull (25 points) et double bull (50 points)
 * 
 * Les sections sont numérotées de 1 à 20 dans un ordre spécifique,
 * avec le 20 en haut et alternant entre sections pour équilibrer les scores.
 */
const DartBoard: React.FC<DartBoardProps> = ({ onScoreSelect }) => {
  const [dartHits, setDartHits] = useState<DartHit[]>([]);

  // Gestion des impacts de fléchettes
  const handleHit = (score: number, multiplier: number, event: React.MouseEvent<SVGElement>) => {
    if (dartHits.length >= 3) {
      // Si on a déjà 3 fléchettes, on recommence
      setDartHits([]);
      return;
    }

    // Calcul de la position relative au SVG
    const svg = event.currentTarget.closest('svg');
    if (!svg) return;

    const pt = svg.createSVGPoint();
    const rect = svg.getBoundingClientRect();
    pt.x = event.clientX - rect.left;
    pt.y = event.clientY - rect.top;
    
    // Conversion en coordonnées SVG
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const newHit: DartHit = { 
      score, 
      multiplier, 
      x: svgP.x, 
      y: svgP.y 
    };
    const newHits = [...dartHits, newHit];
    setDartHits(newHits);

    // Si on a 3 fléchettes, on calcule le score total
    if (newHits.length === 3) {
      const totalScore = newHits.reduce((sum, hit) => sum + (hit.score * hit.multiplier), 0);
      onScoreSelect(totalScore, 1); // On envoie le score total
    }
  };

  // Les sections de score sur la cible, dans l'ordre horaire en partant du haut (20)
  const sections = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  
  // Dimensions du SVG et de la cible
  const size = 400; // Taille totale du SVG en pixels
  const center = size / 2; // Point central de la cible
  const radius = size * 0.50; // Rayon total de la cible (50% de la taille du SVG)

  // Rayons des différentes zones (en pourcentage du rayon total)
  const doubleRing = radius * 0.88;  // Anneau extérieur (double)
  const outerSingle = radius * 0.85; // Limite extérieure de la zone simple
  const tripleRing = radius * 0.55;  // Anneau triple
  const innerSingle = radius * 0.45; // Limite intérieure de la zone simple
  const bullOuter = radius * 0.16;   // Bull extérieur (25 points)
  const bullInner = radius * 0.08;   // Bull central (50 points)

  /**
   * Crée un segment de la cible avec ses différentes zones
   * @param index Position du segment (0-19)
   * @param score Valeur du score pour ce segment (1-20)
   */
  const createSection = (index: number, score: number) => {
    const angle = 18; // Angle de chaque segment (360° / 20 sections)
    const startAngle = index * angle - 99; // Angle de départ (-99 pour aligner le 20 en haut)
    const endAngle = startAngle + angle;
    
    // Conversion des angles en radians pour les calculs
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calcul de la position du numéro
    const textRadius = radius * 0.94; // Position des numéros (96% du rayon)
    const textAngle = (startAngle + endAngle) / 2;
    const textRad = (textAngle * Math.PI) / 180;
    const textX = center + textRadius * Math.cos(textRad);
    const textY = center + textRadius * Math.sin(textRad);

    // Définition des chemins SVG pour chaque zone du segment
    const paths = [
      // Double ring (multiplicateur x2)
      `M ${center + doubleRing * Math.cos(startRad)} ${center + doubleRing * Math.sin(startRad)}
       A ${doubleRing} ${doubleRing} 0 0 1 ${center + doubleRing * Math.cos(endRad)} ${center + doubleRing * Math.sin(endRad)}
       L ${center + outerSingle * Math.cos(endRad)} ${center + outerSingle * Math.sin(endRad)}
       A ${outerSingle} ${outerSingle} 0 0 0 ${center + outerSingle * Math.cos(startRad)} ${center + outerSingle * Math.sin(startRad)} Z`,
      
      // Outer single (multiplicateur x1)
      `M ${center + outerSingle * Math.cos(startRad)} ${center + outerSingle * Math.sin(startRad)}
       A ${outerSingle} ${outerSingle} 0 0 1 ${center + outerSingle * Math.cos(endRad)} ${center + outerSingle * Math.sin(endRad)}
       L ${center + tripleRing * Math.cos(endRad)} ${center + tripleRing * Math.sin(endRad)}
       A ${tripleRing} ${tripleRing} 0 0 0 ${center + tripleRing * Math.cos(startRad)} ${center + tripleRing * Math.sin(startRad)} Z`,
      
      // Triple ring (multiplicateur x3)
      `M ${center + tripleRing * Math.cos(startRad)} ${center + tripleRing * Math.sin(startRad)}
       A ${tripleRing} ${tripleRing} 0 0 1 ${center + tripleRing * Math.cos(endRad)} ${center + tripleRing * Math.sin(endRad)}
       L ${center + innerSingle * Math.cos(endRad)} ${center + innerSingle * Math.sin(endRad)}
       A ${innerSingle} ${innerSingle} 0 0 0 ${center + innerSingle * Math.cos(startRad)} ${center + innerSingle * Math.sin(startRad)} Z`,
      
      // Inner single (multiplicateur x1)
      `M ${center + innerSingle * Math.cos(startRad)} ${center + innerSingle * Math.sin(startRad)}
       A ${innerSingle} ${innerSingle} 0 0 1 ${center + innerSingle * Math.cos(endRad)} ${center + innerSingle * Math.sin(endRad)}
       L ${center + bullOuter * Math.cos(endRad)} ${center + bullOuter * Math.sin(endRad)}
       A ${bullOuter} ${bullOuter} 0 0 0 ${center + bullOuter * Math.cos(startRad)} ${center + bullOuter * Math.sin(startRad)} Z`
    ];

    // Alterne les couleurs pour les sections paires/impaires
    const isEvenSection = index % 2 === 0;

    // Vérifie si une section est touchée
    const isHit = (pathIndex: number) => {
      return dartHits.some(hit => 
        hit.score === score && 
        (pathIndex === 0 && hit.multiplier === 2 ||
         (pathIndex === 1 || pathIndex === 3) && hit.multiplier === 1 ||
         pathIndex === 2 && hit.multiplier === 3)
      );
    };

    return (
      <g key={score}>
        {/* Double (x2) */}
        <path
          d={paths[0]}
          className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors ${
            isHit(0) ? 'fill-[var(--neon-primary)] opacity-70' : isEvenSection ? "fill-[#1a1a1a]" : "fill-[#000]"
          }`}
          onClick={(e) => handleHit(score, 2, e)}
        />
        {/* Outer single (x1) */}
        <path
          d={paths[1]}
          className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors ${
            isHit(1) ? 'fill-[var(--neon-primary)] opacity-70' : isEvenSection ? "fill-[#cc0000]" : "fill-[#fff]"
          }`}
          onClick={(e) => handleHit(score, 1, e)}
        />
        {/* Triple (x3) */}
        <path
          d={paths[2]}
          className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors ${
            isHit(2) ? 'fill-[var(--neon-primary)] opacity-70' : isEvenSection ? "fill-[#1a1a1a]" : "fill-[#000]"
          }`}
          onClick={(e) => handleHit(score, 3, e)}
        />
        {/* Inner single (x1) */}
        <path
          d={paths[3]}
          className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors ${
            isHit(3) ? 'fill-[var(--neon-primary)] opacity-70' : isEvenSection ? "fill-[#cc0000]" : "fill-[#fff]"
          }`}
          onClick={(e) => handleHit(score, 1, e)}
        />
        {/* Numéro de la section */}
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          className="font-bold text-lg"
        >
          {score}
        </text>
      </g>
    );
  };

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="game-card p-4"
      >
        {/* Cercle de fond */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="fill-[#2a2a2a] stroke-[#a0a0a0] stroke-2"
        />
        
        {/* Sections numérotées */}
        {sections.map((score, index) => createSection(index, score))}
        
        {/* Double bull (50 points) */}
        <circle
          cx={center}
          cy={center}
          r={bullOuter}
          className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors ${
            dartHits.some(hit => hit.score === 25 && hit.multiplier === 2)
              ? 'fill-[var(--neon-primary)] opacity-70'
              : 'fill-[#1a1a1a]'
          }`}
          onClick={(e) => handleHit(25, 2, e)}
        />
        
        {/* Single bull (25 points) */}
        <circle
          cx={center}
          cy={center}
          r={bullInner}
          className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors ${
            dartHits.some(hit => hit.score === 25 && hit.multiplier === 1)
              ? 'fill-[var(--neon-primary)] opacity-70'
              : 'fill-[#cc0000]'
          }`}
          onClick={(e) => handleHit(25, 1, e)}
        />

        {/* Affichage des impacts */}
        {dartHits.map((hit, index) => (
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

      {/* Compteur de fléchettes */}
      <div className="absolute top-2 right-2 bg-[var(--glass-bg)] px-3 py-1 rounded-full">
        <span className="text-[var(--text-primary)]">
          Fléchettes : {dartHits.length}/3
        </span>
      </div>
    </div>
  );
};

export default DartBoard; 