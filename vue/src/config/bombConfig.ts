import bombSprite from './../assets/animation/bomb-sprite.png'

export interface BombConfig {
  spritePath: string
  totalFrames: number
  frameWidth: number
  frameHeight: number
  spriteWidth: number
  defaultDuration: number
  defaultDetonateFrame: number
}

export const BOMB_CONFIG: BombConfig = {
  spritePath: bombSprite,
  totalFrames: 105,
  frameWidth: 90,
  frameHeight: 90,
  spriteWidth: 105 * 90,
  defaultDuration: 1500,
  defaultDetonateFrame: 76
}

export const preloadBombSprite = (): void => {
  const img = new Image()
  img.src = BOMB_CONFIG.spritePath
}