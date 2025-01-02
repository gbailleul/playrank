import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Game, GameSession, PlayerGame } from '../types';

const GameBoard: React.FC = () => {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<PlayerGame[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentScore, setCurrentScore] = useState<number>(0);

  useEffect(() => {
    fetchGameData();
  }, [id]);

  const fetchGameData = async () => {
    try {
      const response = await fetch(`/api/games/${id}`);
      if (response.ok) {
        const gameData = await response.json();
        setGame(gameData);
        if (gameData.sessions?.length > 0) {
          const latestSession = gameData.sessions[gameData.sessions.length - 1];
          setCurrentSession(latestSession);
          setPlayers(latestSession.players);
        }
      }
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  const calculateRemainingScore = (player: PlayerGame) => {
    const totalScore = player.scores.reduce((sum, score) => sum + score.value, 0);
    return game ? game.maxScore - totalScore : 0;
  };

  const isValidScore = (score: number) => {
    // Vérifier si le score est valide pour le jeu de fléchettes
    if (score < 0 || score > 180) return false; // Score maximum possible en un tour (3 x Triple 20)
    
    // Vérifier les combinaisons valides pour un tour
    const validScores = [
      0, // Pas de points
      ...Array.from({ length: 20 }, (_, i) => i + 1), // Singles 1-20
      ...Array.from({ length: 20 }, (_, i) => (i + 1) * 2), // Doubles 2-40
      ...Array.from({ length: 20 }, (_, i) => (i + 1) * 3), // Triples 3-60
      25, // Outer bullseye
      50, // Inner bullseye
    ];

    return validScores.includes(score);
  };

  const handleScoreSubmit = async () => {
    if (!game || !currentSession || !players.length) return;

    if (!isValidScore(currentScore)) {
      alert('Score invalide. Veuillez entrer un score valide pour le jeu de fléchettes.');
      return;
    }

    const player = players[currentPlayer];
    const remainingScore = calculateRemainingScore(player) - currentScore;

    // Vérifier si le score final est exactement 0 et se termine par un double
    if (remainingScore < 0 || (remainingScore === 0 && currentScore % 2 !== 0)) {
      alert('Score invalide. Le jeu doit se terminer exactement à 0 avec un double.');
      return;
    }

    try {
      const response = await fetch(`/api/games/${game.id}/sessions/${currentSession.id}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: player.playerId,
          points: currentScore,
          turnNumber: player.scores.length + 1,
        }),
      });

      if (response.ok) {
        // Mettre à jour le joueur suivant
        setCurrentPlayer((prev) => (prev + 1) % players.length);
        setCurrentScore(0);
        
        // Recharger les données du jeu
        await fetchGameData();
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  if (!game || !currentSession) {
    return <div className="text-center py-8">Chargement du jeu...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">{game.name}</h1>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.map((player, index) => (
                <div
                  key={player.playerId}
                  className={`text-center p-4 rounded-lg ${
                    index === currentPlayer ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <h3 className="font-semibold">
                    {player.player.firstName} {player.player.lastName}
                  </h3>
                  <p className="text-2xl font-bold">{calculateRemainingScore(player)}</p>
                  <div className="text-sm space-y-1">
                    {player.scores.map((score, idx) => (
                      <p key={idx}>{score.value}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label htmlFor="score" className="block text-sm font-medium mb-1">
                  Score du lancer
                </label>
                <input
                  id="score"
                  type="number"
                  min="0"
                  max="180"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(parseInt(e.target.value) || 0)}
                  placeholder="Entrez le score"
                  className="game-input w-full"
                />
              </div>
              <button
                onClick={handleScoreSubmit}
                className="game-button"
              >
                Valider le score
              </button>
            </div>

            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Règles :</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Chaque joueur commence avec {game.maxScore} points</li>
                <li>Le but est d'atteindre exactement 0 point</li>
                <li>Le dernier lancer doit être un double</li>
                <li>
                  Les scores valides sont : singles (1-20), doubles (2-40), triples (3-60), et
                  bullseye (25, 50)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard; 