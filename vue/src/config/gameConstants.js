export const BOMB_CONFIG = {
  radius: 80,
  rewardInterval: 10
}

export const PHYSICS_CONFIG = {
  maxSpeed: 4,
  decayTime: 2000,
  decayRate: 0.95,
  minTimeBetweenPushes: 100,
  speedMultiplier: 144
}

export const SPAWN_CONFIG = {
  areaWidthRatio: 0.6,
  startY: -150,
}

export const MULTIPLIER_CONFIG = {
  correct: {
    multiplier: 1.2,
    max: 5
  },
  wrong: {
    multiplier: 1.3,
    max: 7
  }
}

export const NOTIFICATION_CONFIG = {
  rewardDuration: 2000,
  noBombsDuration: 2000,
  hintDuration: 4000,
  noBombsCooldown: 2000
}