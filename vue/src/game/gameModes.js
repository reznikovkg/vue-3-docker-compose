import { BUBBLE_RULES } from '@/constants/gameConfig.js'

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
  if (!ctx || !ctx.$refs || !ctx.$refs.gameField) {
    return null
  }

  if (ctx.autoShotTimerId) {
    clearInterval(ctx.autoShotTimerId)
  }

  const field = ctx.$refs.gameField
  //позишн поля на экране
  const rect = field.getBoundingClientRect()

  ctx.autoShotTimerId = setInterval(() => {
    //реальные размеры
    const width = field.clientWidth
    const height = field.clientHeight
    //точка выстрела
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)
    //id для метки
    const id = Date.now() + Math.random()

    ctx.marks = [...ctx.marks, { id, x, y, isActive: true }]

    //затухашка
    setTimeout(() => {
      ctx.marks = ctx.marks.map((mark) => {
        if (mark.id === id) {
          return {
            ...mark,
            isActive: false
          }
        }

        return mark
      })
    }, 1600)

    setTimeout(() => {
      ctx.marks = ctx.marks.filter((mark) => mark.id !== id)
    }, 2000)

    // для клика перевод
    ctx.handleFieldClick({
      clientX: rect.left + x,
      clientY: rect.top + y
    })
  }, 500)

  return ctx.autoShotTimerId
}

export function stopAutoMode(ctx) {
  if (!ctx) {
    return null
  }

  if (ctx.autoShotTimerId) {
    clearInterval(ctx.autoShotTimerId)
    ctx.autoShotTimerId = null
  }

  ctx.activeMode = 'normal'

  return null
}

export function applyCombo(ctx, bubble, x, y, index = 0) {
  if (!ctx || !bubble) {
    return 0
  }

  const getSafeValue = (value) => {
    return Number(value.toFixed(2))
  }

  const addComboText = (text) => {
    const id = Date.now() + Math.random()
    const item = {
      id,
      x: x + 12,
      y: y - 12 - index * 18,
      text
    }

    ctx.comboTextItems = [...ctx.comboTextItems, item]

    setTimeout(() => {
      ctx.comboTextItems = ctx.comboTextItems.filter((comboItem) => comboItem.id !== id)
    }, 900)
  }

  if (bubble.color === ctx.targetColor) {
    const delta = getSafeValue(ctx.scoreHit * ctx.hitComboMultiplier)
    ctx.hitComboMultiplier = getSafeValue(Math.min(ctx.hitComboMultiplier * 1.2, 5))
    addComboText('Комбо x' + ctx.hitComboMultiplier.toFixed(1))
    return delta
  }

  const penalty = BUBBLE_RULES.miss[bubble.size] || ctx.scoreMiss
  const delta = getSafeValue(penalty * ctx.missComboMultiplier)
  ctx.missComboMultiplier = getSafeValue(Math.min(ctx.missComboMultiplier * 1.3, 7))
  addComboText('Комбо x' + ctx.missComboMultiplier.toFixed(1))
  return delta
}

export function spawnBomb(ctx, x, y) {
  return {
    ctx,
    x,
    y
  }
}
