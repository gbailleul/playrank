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
import { CricketThrow } from '../../types/cricket';

/**
 * Props du composant CricketDartBoard
 */
interface CricketDartBoardProps {
  playerId: string;
  onScoreClick: (throws: CricketThrow[]) => Promise<void>;
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
  playerId,
  onScoreClick,
}) => {
  const [throwsInTurn, setThrowsInTurn] = useState<CricketThrow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNumberClick = (target: number, multiplier: number) => {
    if (throwsInTurn.length >= 3 || isSubmitting) return;

    const newThrow: CricketThrow = {
      target,
      multiplier
    };

    setThrowsInTurn(prev => [...prev, newThrow]);
  };

  const handleValidateScore = async () => {
    if (throwsInTurn.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onScoreClick(throwsInTurn);
      setThrowsInTurn([]);
    } catch (error) {
      console.error('Error submitting throws:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Cibles</h2>
      <div className="grid grid-cols-4 gap-4">
        {[15, 16, 17, 18, 19, 20, 25].map((target) => (
          <div key={target} className="space-y-2">
            <div className="text-center font-medium">{target}</div>
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3].map((multiplier) => (
                <button
                  key={`${target}-${multiplier}`}
                  onClick={() => handleNumberClick(target, multiplier)}
                  disabled={throwsInTurn.length >= 3 || isSubmitting}
                  className={`p-2 text-sm rounded ${
                    throwsInTurn.length >= 3 || isSubmitting
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-blue-100 hover:bg-blue-200'
                  }`}
                >
                  {multiplier}x
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="mb-2">
          <h3 className="font-medium">Lancers dans ce tour :</h3>
          <div className="flex gap-2">
            {throwsInTurn.map((t, i) => (
              <div key={i} className="bg-gray-100 p-2 rounded">
                {t.target} x{t.multiplier}
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleValidateScore}
          disabled={throwsInTurn.length === 0 || isSubmitting}
          className={`w-full p-2 rounded font-medium ${
            throwsInTurn.length === 0 || isSubmitting
              ? 'bg-gray-100 text-gray-400'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isSubmitting ? 'Validation...' : 'Valider les scores'}
        </button>
      </div>
    </div>
  );
};

export default CricketDartBoard; 