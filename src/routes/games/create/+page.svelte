<script lang="ts">
  import { enhance } from '$app/forms';
  import type { CreateGameDto } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';

  let gameType = 'DARTS';
  let maxScore = 501;
  let minPlayers = 2;
  let maxPlayers = 4;
  let name = '';
  let description = '';

  const handleSubmit = async (event: SubmitEvent) => {
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const gameData: CreateGameDto = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      gameType: 'DARTS',
      maxScore: parseInt(formData.get('maxScore') as string),
      minPlayers: parseInt(formData.get('minPlayers') as string),
      maxPlayers: parseInt(formData.get('maxPlayers') as string),
    };

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (response.ok) {
        const game = await response.json();
        window.location.href = `/games/${game.id}`;
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };
</script>

<div class="container mx-auto py-8">
  <Card class="max-w-2xl mx-auto">
    <CardHeader>
      <CardTitle>Create New Darts Game</CardTitle>
      <CardDescription>Set up a new game of 301 or 501 darts</CardDescription>
    </CardHeader>
    <CardContent>
      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div class="space-y-2">
          <Label for="name">Game Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Friday Night Darts"
            required
            bind:value={name}
          />
        </div>

        <div class="space-y-2">
          <Label for="description">Description (Optional)</Label>
          <Input
            id="description"
            name="description"
            type="text"
            placeholder="Weekly darts tournament"
            bind:value={description}
          />
        </div>

        <div class="space-y-2">
          <Label>Game Variant</Label>
          <RadioGroup name="maxScore" bind:value={maxScore} class="grid grid-cols-2 gap-4">
            <div class="flex items-center space-x-2">
              <RadioGroupItem value={301} id="301" />
              <Label for="301">301</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value={501} id="501" />
              <Label for="501">501</Label>
            </div>
          </RadioGroup>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="minPlayers">Minimum Players</Label>
            <Input
              id="minPlayers"
              name="minPlayers"
              type="number"
              min="2"
              max="8"
              required
              bind:value={minPlayers}
            />
          </div>
          <div class="space-y-2">
            <Label for="maxPlayers">Maximum Players</Label>
            <Input
              id="maxPlayers"
              name="maxPlayers"
              type="number"
              min="2"
              max="8"
              required
              bind:value={maxPlayers}
            />
          </div>
        </div>

        <Button type="submit" class="w-full">Create Game</Button>
      </form>
    </CardContent>
  </Card>
</div> 