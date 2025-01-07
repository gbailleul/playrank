export type CricketTarget = 15 | 16 | 17 | 18 | 19 | 20 | 25 // 25 pour le Bull's eye

export type CricketScore = {
  hits: number // Nombre de touches (0-3)
  points: number // Points marqués sur ce numéro
}

export type PlayerCricketScores = {
  [key in CricketTarget]: CricketScore
}

export type CricketGameState = {
  players: {
    id: string
    username: string
    scores: PlayerCricketScores
    totalPoints: number
  }[]
  currentPlayerIndex: number
  gameStatus: 'IN_PROGRESS' | 'COMPLETED'
  winner?: string
}

export type CricketHit = {
  target: CricketTarget
  multiplier: 1 | 2 | 3 // Simple, double ou triple
  playerId: string
} 