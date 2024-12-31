<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import type { Game, GameSession, PlayerGame, Score } from '$lib/types';

  let game: Game;
  let currentSession: GameSession;
  let players: PlayerGame[] = [];
  let currentPlayer: number = 0;
  let currentScore: number = 0;

  onMount(async () => {
    try {
      const response = await fetch(`/api/games/${$page.params.id}`);
      if (response.ok) {
        game = await response.json();
        if (game.sessions?.length > 0) {
          currentSession = game.sessions[game.sessions.length - 1];
          players = currentSession.players;
        }
      }
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  });

  const calculateRemainingScore = (player: PlayerGame) => {
    const totalScore = player.scores.reduce((sum, score) => sum + score.value, 0);
    return game.maxScore - totalScore;
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
        currentPlayer = (currentPlayer + 1) % players.length;
        currentScore = 0;
        
        // Recharger les données du jeu
        const gameResponse = await fetch(`/api/games/${game.id}`);
        if (gameResponse.ok) {
          game = await gameResponse.json();
          currentSession = game.sessions[game.sessions.length - 1];
          players = currentSession.players;
        }
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };
</script>

<div class="container mx-auto py-8">
  <Card class="max-w-4xl mx-auto">
    <CardHeader>
      <CardTitle>{game?.name || 'Loading...'}</CardTitle>
    </CardHeader>
    <CardContent>
      {#if game && currentSession}
        <div class="space-y-6">
          <div class="grid grid-cols-{players.length} gap-4">
            {#each players as player, index}
              <div class="text-center p-4 rounded-lg {index === currentPlayer ? 'bg-primary/10' : 'bg-secondary/10'}">
                <h3 class="font-semibold">{player.player.firstName} {player.player.lastName}</h3>
                <p class="text-2xl font-bold">{calculateRemainingScore(player)}</p>
                <div class="text-sm space-y-1">
                  {#each player.scores as score}
                    <p>{score.value}</p>
                  {/each}
                </div>
              </div>
            {/each}
          </div>

          <div class="flex items-end gap-4">
            <div class="flex-1">
              <Label for="score">Score du lancer</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="180"
                bind:value={currentScore}
                placeholder="Entrez le score"
              />
            </div>
            <Button on:click={handleScoreSubmit}>Valider le score</Button>
          </div>

          <div class="text-sm text-muted-foreground">
            <p>Règles :</p>
            <ul class="list-disc list-inside">
              <li>Chaque joueur commence avec {game.maxScore} points</li>
              <li>Le but est d'atteindre exactement 0 point</li>
              <li>Le dernier lancer doit être un double</li>
              <li>Les scores valides sont : singles (1-20), doubles (2-40), triples (3-60), et bullseye (25, 50)</li>
            </ul>
          </div>
        </div>
      {:else}
        <p>Chargement du jeu...</p>
      {/if}
    </CardContent>
  </Card>
</div> 