import React, { useEffect, useRef, useState } from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children, className = '' }) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      if (tableRef.current) {
        const { scrollWidth, clientWidth } = tableRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    // Vérifier au chargement et au redimensionnement
    checkScroll();
    window.addEventListener('resize', checkScroll);

    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <>
      <div ref={tableRef} className={`table-container ${className}`}>
        {children}
      </div>
      {showScrollIndicator && (
        <div className="table-scroll-indicator">
          ← Faites défiler →
        </div>
      )}
    </>
  );
};

export default ResponsiveTable; 