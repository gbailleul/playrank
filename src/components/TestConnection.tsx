import { useState, useEffect } from 'react';
import { gameService } from '../api/services';
import axios from 'axios';

const TestConnection = () => {
  const [backendStatus, setBackendStatus] = useState<'Connected' | 'Not Connected'>('Not Connected');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [testResults, setTestResults] = useState<{
    createGame: { status: string; message: string } | null;
    getGames: { status: string; message: string } | null;
  }>({
    createGame: null,
    getGames: null,
  });

  const checkBackendStatus = async () => {
    try {
      await axios.get('http://localhost:8000/api/health');
      setBackendStatus('Connected');
    } catch (error) {
      setBackendStatus('Not Connected');
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleTestCreateGame = async () => {
    try {
      const { data } = await gameService.createGame({
        name: 'Test Game',
        type: 'DARTS',
        description: 'A test game',
        maxScore: 501,
        minPlayers: 2,
        maxPlayers: 4,
      });
      setTestResults(prev => ({
        ...prev,
        createGame: {
          status: 'success',
          message: `Game created with ID: ${data.id}`,
        },
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        createGame: {
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to create game',
        },
      }));
    }
  };

  const handleTestGetGames = async () => {
    try {
      const { data } = await gameService.getAllGames();
      setTestResults(prev => ({
        ...prev,
        getGames: {
          status: 'success',
          message: `Retrieved ${data.length} games`,
        },
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        getGames: {
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to get games',
        },
      }));
    }
  };

  return (
    <div className="container-sm py-8">
      <div className="game-card p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Test de connexion API</h2>
          <p className="text-[var(--text-secondary)]">
            Testez la connexion à l'API backend et vérifiez le fonctionnement des points de terminaison.
          </p>
        </div>

        {/* Backend Status */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">État du backend</h3>
          <div className="flex items-center space-x-4">
            <div
              className={`status-indicator ${
                backendStatus === 'Connected' ? 'status-success' : 'status-error'
              }`}
            >
              {backendStatus}
            </div>
            {lastChecked && (
              <span className="text-sm text-[var(--text-secondary)]">
                Dernière vérification : {lastChecked.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={checkBackendStatus}
              className="btn-secondary text-sm"
            >
              Vérifier maintenant
            </button>
          </div>
        </div>

        {/* Connection Info */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Informations de connexion</h3>
          <div className="game-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">URL Frontend :</span>
              <span>http://localhost:5173</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">URL Backend :</span>
              <span>http://localhost:8000</span>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Actions de test</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleTestCreateGame}
              className="btn-primary"
              disabled={backendStatus !== 'Connected'}
            >
              Test création partie
            </button>
            <button
              onClick={handleTestGetGames}
              className="btn-primary"
              disabled={backendStatus !== 'Connected'}
            >
              Test obtention parties
            </button>
          </div>
        </div>

        {/* Test Results */}
        {(testResults.createGame || testResults.getGames) && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Test Results</h3>
            <div className="space-y-4">
              {testResults.createGame && (
                <div className="game-card p-4">
                  <h4 className="font-medium mb-2">Create Game Test</h4>
                  <div
                    className={`status-indicator ${
                      testResults.createGame.status === 'success'
                        ? 'status-success'
                        : 'status-error'
                    }`}
                  >
                    {testResults.createGame.message}
                  </div>
                </div>
              )}
              {testResults.getGames && (
                <div className="game-card p-4">
                  <h4 className="font-medium mb-2">Get Games Test</h4>
                  <div
                    className={`status-indicator ${
                      testResults.getGames.status === 'success'
                        ? 'status-success'
                        : 'status-error'
                    }`}
                  >
                    {testResults.getGames.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestConnection; 