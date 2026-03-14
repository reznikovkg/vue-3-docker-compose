const getRandomInRange = (min, max, rng) => min + rng() * (max - min)

const getFishById = (fishDefinitions, fishId) =>
  fishDefinitions.find((fish) => fish.id === fishId) || null

const TIER_FACTOR = 0.14
const QUALITY_DIVISOR = 160
const SIZE_DIVISOR = 25
const DEFAULT_LOCATION_MULTIPLIER = 1
const DEFAULT_GEAR_MULTIPLIER = 1
const DEFAULT_PRECISION = 2
const MIN_DIFFICULTY_MULTIPLIER = 0.6
const MAX_DIFFICULTY_MULTIPLIER = 1.4

const roundValue = (value, precision = DEFAULT_PRECISION) =>
  Number(value.toFixed(precision))
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const rollRange = (range, rng) =>
  roundValue(getRandomInRange(range[0], range[1], rng))

const pickWeightedEntry = (weightedEntries, rng) => {
  if (!weightedEntries.length) {
    return null
  }

  let cursor = rng()
  for (const item of weightedEntries) {
    cursor -= item.weight
    if (cursor <= 0) {
      return item
    }
  }

  return weightedEntries[weightedEntries.length - 1] || null
}

const getLocationDifficultyMultiplier = (location = null) =>
  Number.isFinite(location?.difficultyMultiplier)
    ? location.difficultyMultiplier
    : DEFAULT_LOCATION_MULTIPLIER

const getGearAffinityMultiplier = (gearItem, fishId) => {
  const affinity = gearItem?.affinityByFishId?.[fishId]
  if (!Number.isFinite(affinity) || affinity <= 0) {
    return 1
  }

  return affinity
}

const getGearDifficultyMultiplier = (gearContext = null) => {
  const rodMultiplier = Number(gearContext?.rod?.difficultyMultiplier)
  const lineMultiplier = Number(gearContext?.line?.difficultyMultiplier)
  const baitMultiplier = Number(gearContext?.bait?.difficultyMultiplier)
  const product =
    (Number.isFinite(rodMultiplier) ? rodMultiplier : 1) *
    (Number.isFinite(lineMultiplier) ? lineMultiplier : 1) *
    (Number.isFinite(baitMultiplier) ? baitMultiplier : 1)

  if (!Number.isFinite(product) || product <= 0) {
    return DEFAULT_GEAR_MULTIPLIER
  }

  return clamp(product, MIN_DIFFICULTY_MULTIPLIER, MAX_DIFFICULTY_MULTIPLIER)
}

const getEncounterScaling = (encounter) => {
  const tierContribution = encounter.tier * TIER_FACTOR
  const qualityContribution = encounter.quality / QUALITY_DIVISOR
  const sizeContribution = encounter.size / SIZE_DIVISOR

  return 1 + tierContribution + qualityContribution + sizeContribution
}

const computeDifficulty = (encounter, location = null, gearContext = null) => {
  const encounterScaling = getEncounterScaling(encounter)
  const baseScore = encounter.baseDifficulty * encounterScaling
  const locationMultiplier = getLocationDifficultyMultiplier(location)
  const gearMultiplier = getGearDifficultyMultiplier(gearContext)

  return roundValue(baseScore * locationMultiplier * gearMultiplier)
}

const buildWeightedTable = (table, gearContext = null) => {
  if (!Array.isArray(table) || !table.length) {
    return []
  }

  const weightedTable = table.map((entry) => {
    const baseWeight = Number(entry?.weight || 0)
    const fishId = entry?.fishId
    const rodAffinity = getGearAffinityMultiplier(gearContext?.rod, fishId)
    const lineAffinity = getGearAffinityMultiplier(gearContext?.line, fishId)
    const baitAffinity = getGearAffinityMultiplier(gearContext?.bait, fishId)
    const adjustedWeight = Math.max(
      0,
      baseWeight * rodAffinity * lineAffinity * baitAffinity,
    )

    return {
      ...entry,
      weight: adjustedWeight,
    }
  })

  const totalWeight = weightedTable.reduce(
    (sum, item) => sum + Number(item.weight || 0),
    0,
  )
  if (totalWeight <= 0) {
    return []
  }

  return weightedTable.map((item) => ({
    ...item,
    weight: item.weight / totalWeight,
  }))
}

const rollEncounter = (
  location,
  fishTables,
  fishDefinitions,
  gearContext = null,
  rng = Math.random,
) => {
  if (!location) {
    return null
  }

  const rawTable = fishTables?.[location.fishTableId] || []
  const table = buildWeightedTable(rawTable, gearContext)
  const weightedEntry = pickWeightedEntry(table, rng)
  if (!weightedEntry) {
    return null
  }

  const fish = getFishById(fishDefinitions, weightedEntry.fishId)
  if (!fish) {
    return null
  }

  const quality = rollRange(fish.qualityRange, rng)
  const size = rollRange(fish.sizeRange, rng)

  const difficultyScore = computeDifficulty(
    {
      baseDifficulty: fish.baseDifficulty,
      tier: fish.tier,
      quality,
      size,
    },
    location,
    gearContext,
  )

  return {
    fishId: fish.id,
    fishName: fish.name,
    tier: fish.tier,
    quality,
    size,
    difficultyScore,
    gear: {
      rodId: gearContext?.rod?.id || null,
      lineId: gearContext?.line?.id || null,
      baitId: gearContext?.bait?.id || null,
    },
  }
}

export { computeDifficulty, rollEncounter }
