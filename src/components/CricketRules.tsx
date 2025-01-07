import React from 'react';

interface CricketRulesProps {
  isOpen: boolean;
  onClose: () => void;
}

const CricketRules: React.FC<CricketRulesProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">🎯 Règles du Cricket</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Fermer les règles"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 text-[var(--text-primary)]">
          <section>
            <h3 className="text-xl font-semibold mb-2">Objectif du jeu</h3>
            <p>Le Cricket est un jeu de fléchettes stratégique où le but est de "fermer" des numéros tout en marquant plus de points que vos adversaires.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Les numéros en jeu</h3>
            <p>Les zones à viser sont :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Les numéros de 15 à 20</li>
              <li>Le Bull's eye (centre de la cible)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Comment jouer</h3>
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <span className="font-semibold">Fermer un numéro :</span>
                <ul className="ml-6 mt-1 space-y-1">
                  <li>• Touchez 3 fois la zone en simple</li>
                  <li>• Ou une fois en triple</li>
                  <li>• Ou une fois en double + une fois en simple</li>
                </ul>
              </li>
              <li>
                <span className="font-semibold">Marquer des points :</span>
                <p className="ml-6 mt-1">Une fois qu'un numéro est fermé, chaque touche rapporte sa valeur en points tant que vos adversaires ne l'ont pas aussi fermé.</p>
              </li>
              <li>
                <span className="font-semibold">Gagner la partie :</span>
                <p className="ml-6 mt-1">Le joueur qui a fermé tous les numéros ET qui a le plus de points remporte la partie.</p>
              </li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Astuces</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Commencez par le 20 pour marquer plus de points</li>
              <li>Fermez rapidement les numéros que vos adversaires utilisent pour marquer</li>
              <li>Le Bull's eye (25 points) peut faire la différence en fin de partie</li>
            </ul>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border-primary)]">
          <button
            onClick={onClose}
            className="w-full bg-[var(--primary)] text-white py-2 px-4 rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
          >
            J'ai compris !
          </button>
        </div>
      </div>
    </div>
  );
};

export default CricketRules; 