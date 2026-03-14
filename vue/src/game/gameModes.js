export function handleLaserMode(ctx, e) {
  if (!ctx || !e) {
    return null
  }

  const x = e.clientX
  const y = e.clientY
  const elements = document.elementsFromPoint(x, y)
  const bubbleElement = elements.find((element) => {
    return element.dataset && element.dataset.id
  })

  if (!bubbleElement) {
    return null
  }

  ctx.handleFieldClick(e)

  return {
    x,
    y,
    id: bubbleElement.dataset.id
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
