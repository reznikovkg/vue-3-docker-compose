export function handleLaserMode(ctx, e) {
  return {
    ctx,
    e
  }
}

export function startAutoMode(ctx) {
  return {
    ctx
  }
}

export function stopAutoMode(ctx) {
  return {
    ctx
  }
}

export function applyCombo(ctx, bubble, isHit) {
  return {
    ctx,
    bubble,
    isHit
  }
}

export function spawnBomb(ctx, x, y) {
  return {
    ctx,
    x,
    y
  }
}
