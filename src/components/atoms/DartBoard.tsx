import React from 'react';

interface DartBoardProps {
  className?: string;
  size?: number;
}

const DartBoard: React.FC<DartBoardProps> = ({ 
  className = '', 
  size = 200 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Définitions des effets */}
      <defs>
        <filter id="boardShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <linearGradient id="metalRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4a5568', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#718096', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#4a5568', stopOpacity: 1 }} />
        </linearGradient>

        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#e53e3e', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: '#e53e3e', stopOpacity: 0 }} />
        </radialGradient>

        <filter id="innerShadow">
          <feOffset dx="0" dy="1" />
          <feGaussianBlur stdDeviation="1" result="offset-blur" />
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
          <feFlood floodColor="black" floodOpacity="0.2" result="color" />
          <feComposite operator="in" in="color" in2="inverse" result="shadow" />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>
      </defs>

      {/* Cadre extérieur */}
      <circle cx="100" cy="100" r="98" fill="url(#metalRing)" filter="url(#boardShadow)" />
      <circle cx="100" cy="100" r="96" fill="none" stroke="#2d3748" strokeWidth="1" />
      <circle cx="100" cy="100" r="90" fill="#1a2234" />

      {/* Sections de score */}
      {[...Array(20)].map((_, i) => {
        const angle = (i * 18) - 9;
        const isEven = i % 2 === 0;
        return (
          <g key={i}>
            <path
              d={`M 100 100 L ${100 + 85 * Math.cos((angle - 9) * Math.PI / 180)} ${100 + 85 * Math.sin((angle - 9) * Math.PI / 180)} A 85 85 0 0 1 ${100 + 85 * Math.cos((angle + 9) * Math.PI / 180)} ${100 + 85 * Math.sin((angle + 9) * Math.PI / 180)} Z`}
              fill={isEven ? '#f4f5f7' : '#1a2234'}
              filter="url(#innerShadow)"
            />
            {/* Triple score ring sections */}
            <path
              d={`M 100 100 L ${100 + 66 * Math.cos((angle - 9) * Math.PI / 180)} ${100 + 66 * Math.sin((angle - 9) * Math.PI / 180)} A 66 66 0 0 1 ${100 + 66 * Math.cos((angle + 9) * Math.PI / 180)} ${100 + 66 * Math.sin((angle + 9) * Math.PI / 180)} Z`}
              fill={isEven ? '#22c55e' : '#15803d'}
              opacity="0.9"
            />
            {/* Double score ring sections */}
            <path
              d={`M 100 100 L ${100 + 85 * Math.cos((angle - 9) * Math.PI / 180)} ${100 + 85 * Math.sin((angle - 9) * Math.PI / 180)} A 85 85 0 0 1 ${100 + 85 * Math.cos((angle + 9) * Math.PI / 180)} ${100 + 85 * Math.sin((angle + 9) * Math.PI / 180)} Z`}
              clipPath="circle(82 at 100 100)"
              fill={isEven ? '#e11d48' : '#be123c'}
              opacity="0.9"
            />
          </g>
        );
      })}

      {/* Anneaux de score */}
      <circle cx="100" cy="100" r="66" fill="none" stroke="#f4f5f7" strokeWidth="1" />
      <circle cx="100" cy="100" r="54" fill="#f4f5f7" filter="url(#innerShadow)" />
      <circle cx="100" cy="100" r="42" fill="#1a2234" filter="url(#innerShadow)" />
      
      {/* Centre */}
      <circle cx="100" cy="100" r="16" fill="#f4f5f7" filter="url(#innerShadow)" />
      <circle cx="100" cy="100" r="8" fill="#e53e3e" />
      <circle cx="100" cy="100" r="12" fill="url(#centerGlow)" />

      {/* Effet de brillance */}
      <circle
        cx="80"
        cy="80"
        r="65"
        fill="url(#metalRing)"
        opacity="0.1"
        style={{ mixBlendMode: 'overlay' }}
      />
    </svg>
  );
};

export default DartBoard; 