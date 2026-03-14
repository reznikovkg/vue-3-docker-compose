const getRandomInRange = (min, max, rng) => min + rng() * (max - min)

const getFishById = (fishDefinitions, fishId) =>
  fishDefinitions.find((fish) => fish.id === fishId) || null

const TIER_FACTOR = 0.14
const QUALITY_DIVISOR = 160
const SIZE_DIVISOR = 25
const DEFAULT_LOCATION_MULTIPLIER = 1
const DEFAULT_PRECISION = 2

const roundValue = (value, precision = DEFAULT_PRECISION) =>
  Number(value.toFixed(precision))

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

const getEncounterScaling = (encounter) => {
  const tierContribution = encounter.tier * TIER_FACTOR
  const qualityContribution = encounter.quality / QUALITY_DIVISOR
  const sizeContribution = encounter.size / SIZE_DIVISOR

  return 1 + tierContribution + qualityContribution + sizeContribution
}

const computeDifficulty = (encounter, location = null) => {
  const encounterScaling = getEncounterScaling(encounter)
  const baseScore = encounter.baseDifficulty * encounterScaling
  const locationMultiplier = getLocationDifficultyMultiplier(location)

  return roundValue(baseScore * locationMultiplier)
}

const rollEncounter = (
  location,
  fishTables,
  fishDefinitions,
  rng = Math.random,
) => {
  if (!location) {
    return null
  }

  const table = fishTables?.[location.fishTableId] || []
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
  )

  return {
    fishId: fish.id,
    fishName: fish.name,
    tier: fish.tier,
    quality,
    size,
    difficultyScore,
  }
}

export { computeDifficulty, rollEncounter }
