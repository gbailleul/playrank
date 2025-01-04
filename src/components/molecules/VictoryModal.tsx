import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

interface VictoryModalProps {
  winner: {
    username: string;
    id: string;
  };
  onClose: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ winner, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Lance les confettis
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50;

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#FFD700', '#FFA500', '#FF4500', '#9400D3', '#4B0082'],
        disableForReducedMotion: true
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black opacity-75" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative z-10 p-8 rounded-lg bg-[#1a1a1a] border-2 border-[var(--neon-primary)] shadow-xl min-w-[300px] text-center">
        <h2 className="text-3xl font-bold text-[var(--neon-primary)] mb-4">🎯 Victoire ! 🎯</h2>
        <p className="text-xl text-[var(--text-primary)] mb-6">
          Félicitations {winner.username} !
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-[var(--neon-primary)] text-white rounded-lg hover:bg-[var(--neon-primary-hover)] transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default VictoryModal; 