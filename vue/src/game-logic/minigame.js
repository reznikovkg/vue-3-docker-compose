const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const buildBarriers = (encounter, tuning, rng = Math.random) => {
  const countRange = tuning.minigame.barrierCountRange
  const minCount = countRange.min
  const maxCount = countRange.max
  const difficultyScore = encounter.difficultyScore
  const difficultyNorm = clamp((difficultyScore - 1) / 1.8, 0, 1)
  const barrierCount = Math.round(
    minCount + difficultyNorm * (maxCount - minCount),
  )
  const tier = encounter.tier
  const clickRange = tuning?.minigame?.barrierClicksByTier?.[tier]

  const start = 0.22
  const end = 0.88
  const spacing = (end - start) / (barrierCount + 1)
  const barriers = []

  for (let index = 0; index < barrierCount; index += 1) {
    const jitter = (rng() - 0.5) * 0.05
    const rawPosition = start + spacing * (index + 1) + jitter
    const minPosition =
      index === 0 ? start : barriers[index - 1].position + 0.12
    const maxPosition = end - (barrierCount - index - 1) * 0.12
    const position = Number(
      clamp(rawPosition, minPosition, maxPosition).toFixed(3),
    )
    const baseClicks =
      clickRange.min + rng() * (clickRange.max - clickRange.min)
    const difficultyClicks = difficultyNorm * 2 + index * 0.5
    const requiredClicks = Math.max(
      1,
      Math.round((baseClicks + difficultyClicks) / 2.5),
    )

    barriers.push({
      id: `barrier-${index + 1}`,
      position,
      requiredClicks,
    })
  }

  return barriers
}

const buildMinigameConfig = (encounter, tuning) => {
  if (!encounter) {
    return null
  }

  const baseGreenSpeed = tuning?.minigame?.greenSpeedBase
  const baseRedSpeed = tuning?.minigame?.redSpeedBase
  const maxTimeMs = tuning?.minigame?.maxTimeMs
  const difficultyScore = encounter.difficultyScore
  const difficultyDelta = Math.max(0, difficultyScore - 1)

  const greenSpeedPerSec = clamp(
    baseGreenSpeed - difficultyDelta * 0.028,
    0.08,
    0.7,
  )
  const redSpeedPerSec = clamp(
    baseRedSpeed + difficultyDelta * 0.036,
    0.02,
    0.9,
  )

  return {
    greenSpeedPerSec: Number(greenSpeedPerSec.toFixed(4)),
    redSpeedPerSec: Number(redSpeedPerSec.toFixed(4)),
    maxTimeMs,
    targetProgress: 1,
    redStartDelayMs: 750,
    difficultyScore,
    barriers: buildBarriers(encounter, tuning),
  }
}

const stepMinigame = (runtimeState, dtMs, inputState, config) => {
  const dtSec = dtMs / 1000
  const elapsedMs = runtimeState.elapsedMs + dtMs
  const greenDelta = inputState.isReeling ? config.greenSpeedPerSec * dtSec : 0
  const redCanAdvance = elapsedMs >= (config.redStartDelayMs || 0)
  const redDelta = redCanAdvance ? config.redSpeedPerSec * dtSec : 0
  let greenProgress = clamp(
    runtimeState.greenProgress + greenDelta,
    0,
    config.targetProgress,
  )
  const redProgress = clamp(
    runtimeState.redProgress + redDelta,
    0,
    config.targetProgress,
  )
  const activeBarrier =
    config.barriers?.[runtimeState.activeBarrierIndex] || null
  const isBarrierUnresolved =
    activeBarrier &&
    runtimeState.barrierClicksDone < activeBarrier.requiredClicks
  const isBarrierBlocking = Boolean(
    isBarrierUnresolved && greenProgress >= activeBarrier.position,
  )

  if (isBarrierBlocking) {
    greenProgress = Math.min(greenProgress, activeBarrier.position)
  }

  const nextState = {
    greenProgress,
    redProgress,
    elapsedMs,
  }

  if (greenProgress >= config.targetProgress) {
    return {
      nextState,
      outcome: {
        status: 'success',
        reason: 'target',
      },
      meta: {
        isBarrierBlocking,
        activeBarrier,
      },
    }
  }

  if (redCanAdvance && redProgress >= greenProgress) {
    return {
      nextState,
      outcome: {
        status: 'fail',
        reason: 'caught_up',
      },
      meta: {
        isBarrierBlocking,
        activeBarrier,
      },
    }
  }

  if (elapsedMs >= config.maxTimeMs) {
    return {
      nextState,
      outcome: {
        status: 'fail',
        reason: 'timeout',
      },
      meta: {
        isBarrierBlocking,
        activeBarrier,
      },
    }
  }

  return {
    nextState,
    outcome: null,
    meta: {
      isBarrierBlocking,
      activeBarrier,
    },
  }
}

export { buildBarriers, buildMinigameConfig, stepMinigame }
