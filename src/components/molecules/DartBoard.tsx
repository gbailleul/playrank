import React, { useState } from 'react';

/**
 * Props pour le composant DartBoard
 * @param onScoreSelect Callback appelé quand un score est sélectionné
 */
interface DartBoardProps {
  onScoreSelect: (score: number, isDouble: boolean, isTriple: boolean) => void;
}

interface DartHit {
  score: number;
  multiplier: number;
  x: number;
  y: number;
  isMiss?: boolean;
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
      setDartHits([]);
      return;
    }

    const svg = event.currentTarget.closest('svg');
    if (!svg) return;

    const svgRect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    
    const x = ((event.clientX - svgRect.left) / svgRect.width) * viewBox.width;
    const y = ((event.clientY - svgRect.top) / svgRect.height) * viewBox.height;

    const newHit: DartHit = { score, multiplier, x, y };
    const newHits = [...dartHits, newHit];
    setDartHits(newHits);
  };

  const handleValidate = () => {
    // Calculer le score total des 3 fléchettes
    const totalScore = dartHits.reduce((sum, hit) => sum + (hit.score * hit.multiplier), 0);
    // Vérifier si l'un des lancers est un double ou un triple
    const isDouble = dartHits.some(hit => hit.multiplier === 2);
    const isTriple = dartHits.some(hit => hit.multiplier === 3);
    // Appeler la fonction du parent avec le score total et les infos de multiplicateur
    onScoreSelect(totalScore, isDouble, isTriple);
    // Réinitialiser les fléchettes
    setDartHits([]);
  };

  // Les sections de score sur la cible, dans l'ordre horaire en partant du haut (20)
  const sections = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  
  // Dimensions du SVG et de la cible
  const size = window.innerWidth < 640 ? Math.min(window.innerWidth - 32, 300) : 400; // Taille adaptative pour mobile
  const center = size / 2;
  const radius = size * 0.50;

  // Rayons des différentes zones (en pourcentage du rayon total)
  const doubleRing = radius * 0.88;  // Anneau extérieur (double)
  const outerSingle = radius * 0.80; // Limite extérieure de la zone simple - Réduit de 0.85 à 0.80
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
          className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors hover:brightness-150 hover:opacity-80 ${
            isHit(0) ? 'fill-[var(--neon-primary)] opacity-70' : isEvenSection ? "fill-[#1a1a1a]" : "fill-[#000]"
          }`}
          onClick={(e) => handleHit(score, 2, e)}
        />
        {/* Outer single (x1) */}
        <path
          d={paths[1]}
          className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors hover:brightness-150 hover:opacity-80 ${
            isHit(1) ? 'fill-[var(--neon-primary)] opacity-70' : isEvenSection ? "fill-[#cc0000]" : "fill-[#fff]"
          }`}
          onClick={(e) => handleHit(score, 1, e)}
        />
        {/* Triple (x3) */}
        <path
          d={paths[2]}
          className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors hover:brightness-150 hover:opacity-80 ${
            isHit(2) ? 'fill-[var(--neon-primary)] opacity-70' : isEvenSection ? "fill-[#1a1a1a]" : "fill-[#000]"
          }`}
          onClick={(e) => handleHit(score, 3, e)}
        />
        {/* Inner single (x1) */}
        <path
          d={paths[3]}
          className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors hover:brightness-150 hover:opacity-80 ${
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

  // Affichage des impacts
  const renderHits = () => {
    return dartHits.filter(hit => !hit.isMiss).map((hit, index) => (
      <g key={index}>
        <circle
          cx={hit.x}
          cy={hit.y}
          r={4}
          className="fill-white stroke-black stroke-1"
          style={{ zIndex: 10 }}
        />
        <circle
          cx={hit.x}
          cy={hit.y}
          r={6}
          className="fill-none stroke-white stroke-1 opacity-50"
          style={{ zIndex: 10 }}
        />
      </g>
    ));
  };

  return (
    <div className="relative w-full max-w-md mx-auto mt-8">
      {/* Zone de Miss - grande zone derrière la cible uniquement */}
      <div 
        className={`absolute -top-16 -left-16 -right-16 bottom-[180px]
          bg-[#1a1a1a] border-2 border-[var(--neon-primary)] border-opacity-20
          backdrop-blur-sm bg-opacity-20 rounded-lg cursor-crosshair
          hover:bg-opacity-30 hover:border-opacity-30 transition-colors duration-200
          ${dartHits.length >= 3 ? 'pointer-events-none !bg-opacity-10 !border-opacity-10' : ''}`}
        onClick={(e) => {
          if (dartHits.length >= 3) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          const newHit = { score: 0, multiplier: 1, x, y, isMiss: true };
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
          width="100%"
          height="100%"
          viewBox={`0 0 ${size} ${size}`}
          className="cursor-crosshair"
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
          
          {/* Single bull (25 points) */}
          <circle
            cx={center}
            cy={center}
            r={bullOuter}
            className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors hover:brightness-150 hover:opacity-80 ${
              dartHits.some(hit => !hit.isMiss && hit.score === 25)
                ? 'fill-[var(--neon-primary)] opacity-70'
                : 'fill-[#1a1a1a]'
            }`}
            onClick={(e) => handleHit(25, 1, e)}
          />
          
          {/* Double bull (50 points) */}
          <circle
            cx={center}
            cy={center}
            r={bullInner}
            className={`cursor-pointer stroke-[#a0a0a0] stroke-1 transition-colors hover:brightness-150 hover:opacity-80 ${
              dartHits.some(hit => !hit.isMiss && hit.score === 50)
                ? 'fill-[var(--neon-primary)] opacity-70'
                : 'fill-[#cc0000]'
            }`}
            onClick={(e) => handleHit(50, 1, e)}
          />

          {/* Affichage des impacts */}
          {renderHits()}
        </svg>

        {/* Indicateur de fléchettes avec scores */}
        <div className="mt-16 flex justify-center items-center gap-2 sm:gap-4">
          {[0, 1, 2].map((index) => {
            const score = index < dartHits.length ? dartHits[index].score * dartHits[index].multiplier : 0;
            const getScoreClass = (score: number) => {
              if (score > 50) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 animate-[sparkle_1.5s_ease-in-out_infinite] relative before:content-[""] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]';
              if (score > 40) return 'bg-gradient-to-br from-purple-600 to-purple-800';
              if (score > 25) return 'bg-gradient-to-br from-blue-600 to-blue-800';
              return 'bg-gray-800';
            };

            return (
              <div 
                key={index} 
                className={`flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 border-gray-700 transition-all duration-300 ${
                  index < dartHits.length ? getScoreClass(score) : 'bg-gray-800 opacity-40'
                }`}
              >
                <svg
                  width="20"
                  height="40"
                  viewBox="0 0 512 512"
                  className="transition-all duration-200 w-8 h-8"
                >
                  <path
                    fill="currentColor"
                    d="M134.745 22.098c-4.538-.146-9.08 1.43-14.893 7.243-5.586 5.586-11.841 21.725-15.248 35.992-.234.979-.444 1.907-.654 2.836l114.254 105.338c-7.18-28.538-17.555-59.985-29.848-86.75-11.673-25.418-25.249-46.657-37.514-57.024-6.132-5.183-11.56-7.488-16.097-7.635zM92.528 82.122L82.124 92.526 243.58 267.651l24.072-24.072L92.528 82.122zm-24.357 21.826c-.929.21-1.857.42-2.836.654-14.267 3.407-30.406 9.662-35.993 15.248-5.813 5.813-7.39 10.355-7.244 14.893.147 4.538 2.452 9.965 7.635 16.098 10.367 12.265 31.608 25.842 57.025 37.515 26.766 12.293 58.211 22.669 86.749 29.848L68.17 103.948zM280.899 255.79l-25.107 25.107 73.265 79.469 31.31-31.31L280.9 255.79zm92.715 85.476l-32.346 32.344 2.07 2.246c.061.058 4.419 4.224 10.585 6.28 6.208 2.069 12.71 2.88 21.902-6.313 9.192-9.192 8.38-15.694 6.31-21.902-2.057-6.174-6.235-10.54-6.283-10.59l-2.238-2.065zm20.172 41.059a46.23 46.23 0 0 1-5.233 6.226 46.241 46.241 0 0 1-6.226 5.235L489.91 489.91l-96.125-107.586z"
                  />
                </svg>
                {/* Score de la fléchette */}
                {index < dartHits.length && (
                  <span className="text-[var(--text-primary)] font-bold text-lg sm:text-2xl mt-1 sm:mt-2">
                    {score}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bouton de validation */}
        <div className="mt-2 sm:mt-4 text-center">
          <button
            onClick={handleValidate}
            className={`game-button ${dartHits.length < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={dartHits.length < 3}
          >
            Valider le score
          </button>
        </div>
      </div>
    </div>
  );
};

export default DartBoard; 