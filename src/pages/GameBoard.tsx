import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Game, GameSession, PlayerGame, Score } from '../types/index';
import { gameService } from '../api/services';

const GameBoard: React.FC = () => {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<PlayerGame[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGameData();
  }, [id]);

  const fetchGameData = async () => {
    try {
      if (!id) return;
      const response = await gameService.getGame(id);
      const gameData = response.data;
      setGame(gameData);
      if (gameData.sessions && gameData.sessions.length > 0) {
        const latestSession = gameData.sessions[gameData.sessions.length - 1];
        setCurrentSession(latestSession);
        setPlayers(latestSession.players);
      }
    } catch (error) {
      console.error('Error fetching game:', error);
      setError('Erreur lors du chargement de la partie');
    }
  };

  const calculateRemainingScore = (player: PlayerGame) => {
    const totalScore = player.scores.reduce((sum: number, score: Score) => sum + score.points, 0);
    return game?.maxScore ? game.maxScore - totalScore : 0;
  };

  const isValidScore = (score: number, remainingScore: number) => {
    // Vérifier si le score est valide pour le jeu de fléchettes
    if (score < 0 || score > 180) return false; // Score maximum possible en un tour (3 x Triple 20)
    
    // Vérifier si le score ne dépasse pas le score restant
    if (score > remainingScore) return false;
    
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
    setError(null);
    setIsLoading(true);

    try {
      const player = players[currentPlayer];
      const remainingScore = calculateRemainingScore(player);

      if (!isValidScore(currentScore, remainingScore)) {
        setError('Score invalide. Veuillez entrer un score valide pour le jeu de fléchettes.');
        return;
      }

      // Vérifier si le score final est exactement 0 et se termine par un double
      const newRemainingScore = remainingScore - currentScore;
      if (newRemainingScore < 0) {
        setError('Score invalide. Le score ne peut pas être négatif.');
        return;
      }
      
      if (newRemainingScore === 0 && currentScore % 2 !== 0) {
        setError('Score invalide. Le jeu doit se terminer exactement à 0 avec un double.');
        return;
      }

      await gameService.addScore(game.id, currentSession.id, {
        playerId: player.playerId,
        points: currentScore,
        turnNumber: player.scores.length + 1,
      });

      // Mettre à jour le joueur suivant
      setCurrentPlayer((prev) => {
        // Si le joueur actuel a gagné (score à 0), on ne change pas de joueur
        if (newRemainingScore === 0) {
          return prev;
        }
        // Sinon, on passe au joueur suivant
        return (prev + 1) % players.length;
      });
      
      setCurrentScore(0);
      await fetchGameData();
    } catch (error) {
      console.error('Error submitting score:', error);
      setError('Erreur lors de l\'envoi du score');
    } finally {
      setIsLoading(false);
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

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.map((player, index) => (
                <div
                  key={player.playerId}
                  className={`text-center p-4 rounded-lg ${
                    index === currentPlayer ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-gray-50'
                  }`}
                >
                  <h3 className="font-semibold">
                    {player.playerId}
                  </h3>
                  <p className="text-2xl font-bold">{calculateRemainingScore(player)}</p>
                  <div className="text-sm space-y-1">
                    {player.scores.map((score: Score, idx: number) => (
                      <p key={idx}>{score.points}</p>
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
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleScoreSubmit}
                className="game-button"
                disabled={isLoading}
              >
                {isLoading ? 'Validation...' : 'Valider le score'}
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