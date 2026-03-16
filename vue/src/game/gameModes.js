import { BUBBLE_RULES, COMBO_RULES, GAME_MODE_RULES } from '@/constants/gameConfig.js'

export const handleLaserMode = (ctx, e) => {
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

export const startAutomatMode = (ctx) => {
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
    }, GAME_MODE_RULES.automat.markHideDelay)

    setTimeout(() => {
      ctx.marks = ctx.marks.filter((mark) => mark.id !== id)
    }, GAME_MODE_RULES.automat.markLife)

    // для клика перевод
    ctx.handleFieldClick({
      clientX: rect.left + x,
      clientY: rect.top + y
    })
  }, GAME_MODE_RULES.automat.shotDelay)

  return ctx.autoShotTimerId
}

export const stopAutomatMode = (ctx) => {
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

export const applyCombo = (ctx, bubble, x, y, index = 0) => {
  if (!ctx || !bubble) {
    return 0
  }

  const getSafeValue = (value) => {
    return Number(value.toFixed(2))
  }

  const addComboText = (text) => {
    const id = Date.now() + Math.random()
    const isHit = bubble.color === ctx.targetColor
    const item = {
      id,
      x: x + COMBO_RULES.textOffsetX,
      y: y - COMBO_RULES.textOffsetY - index * COMBO_RULES.textStepY,
      text,
      type: isHit ? 'hit' : 'miss'
    }

    ctx.comboTextItems = [...ctx.comboTextItems, item]

    setTimeout(() => {
      ctx.comboTextItems = ctx.comboTextItems.filter((comboItem) => comboItem.id !== id)
    }, COMBO_RULES.textLife)
  }

  if (bubble.color === ctx.targetColor) {
    const delta = getSafeValue(ctx.scoreHit * ctx.hitComboMultiplier)
    ctx.hitComboMultiplier = getSafeValue(Math.min(ctx.hitComboMultiplier * COMBO_RULES.hitStep, COMBO_RULES.hitMax))
    addComboText('Бонус x' + ctx.hitComboMultiplier.toFixed(1))
    return delta
  }

  const penalty = BUBBLE_RULES.miss[bubble.size] || ctx.scoreMiss
  const delta = getSafeValue(penalty * ctx.missComboMultiplier)
  ctx.missComboMultiplier = getSafeValue(Math.min(ctx.missComboMultiplier * COMBO_RULES.missStep, COMBO_RULES.missMax))
  addComboText('Штраф x' + ctx.missComboMultiplier.toFixed(1))
  return delta
}

export const spawnBomb = (ctx, x, y) => {
  if (!ctx) {
    return null
  }

  //точка бомбы по полю
  const bombX = Math.round(x)
  const bombY = Math.round(y)
  // id объекта бомбы
  const id = Date.now() + Math.random()
  const bomb = {
    id,
    x: bombX,
    y: bombY,
    isGrow: false
  }

  ctx.bombItems = [...ctx.bombItems, bomb]

  setTimeout(() => {
    //фаза увеличения бомбы
    ctx.bombItems = ctx.bombItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isGrow: true
        }
      }

      return item
    })
  }, GAME_MODE_RULES.bomb.growDelay)

  setTimeout(() => {
    //id и размер взрыва
    const explosionId = Date.now() + Math.random()
    const radius = GAME_MODE_RULES.bomb.radius
    const explosion = {
      id: explosionId,
      x: bombX,
      y: bombY,
      size: radius * 2
    }

    let nextBubbles = [...ctx.bubbles]

    ctx.bubbles.forEach((bubble) => {
      //центр пузыря
      const bubbleX = bubble.x + bubble.r
      const bubbleY = bubble.y + bubble.r
      //расстояние от взрыва до пузыря
      const dx = bubbleX - bombX
      const dy = bubbleY - bombY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > radius) {
        return
      }

      if (bubble.size === 'big') {
        const childBubbles = ctx.createChildBubbles(bubble, 7, 'small')
        nextBubbles = nextBubbles.filter((item) => item.id !== bubble.id)
        nextBubbles = [...nextBubbles, ...childBubbles]
        return
      }

      nextBubbles = nextBubbles.filter((item) => item.id !== bubble.id)
    })

    ctx.bubbles = nextBubbles
    ctx.bombItems = ctx.bombItems.filter((item) => item.id !== id)
    ctx.bombExplosionItems = [...ctx.bombExplosionItems, explosion]

    setTimeout(() => {
      ctx.bombExplosionItems = ctx.bombExplosionItems.filter((item) => item.id !== explosionId)
    }, GAME_MODE_RULES.bomb.explosionLife)
  }, GAME_MODE_RULES.bomb.explodeDelay)

  return bomb
}
