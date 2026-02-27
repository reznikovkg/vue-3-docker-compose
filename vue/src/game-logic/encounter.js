const getRandomInRange = (min, max, rng) => min + rng() * (max - min);

const getFishById = (fishDefinitions, fishId) =>
  fishDefinitions.find((fish) => fish.id === fishId) || null;

const pickWeightedEntry = (weightedEntries, rng) => {
  const totalWeight = weightedEntries.reduce(
    (sum, item) => sum + item.weight,
    0,
  );
  if (totalWeight <= 0) {
    return weightedEntries[0] || null;
  }

  let cursor = rng() * totalWeight;
  for (let i = 0; i < weightedEntries.length; i += 1) {
    const item = weightedEntries[i];
    cursor -= item.weight;
    if (cursor <= 0) {
      return item;
    }
  }

  return weightedEntries[weightedEntries.length - 1] || null;
};

const computeDifficulty = (encounter, location = null) => {
  const baseScore =
    encounter.baseDifficulty *
    (1 + encounter.tier * 0.14 + encounter.quality / 160 + encounter.size / 25);
  const locationMultiplier = Number.isFinite(location?.difficultyMultiplier)
    ? location.difficultyMultiplier
    : 1;

  return Number((baseScore * locationMultiplier).toFixed(2));
};

const rollEncounter = (
  location,
  fishTables,
  fishDefinitions,
  rng = Math.random,
) => {
  if (!location) {
    return null;
  }

  const table = fishTables?.[location.fishTableId] || [];
  const weightedEntry = pickWeightedEntry(table, rng);
  if (!weightedEntry) {
    return null;
  }

  const fish = getFishById(fishDefinitions, weightedEntry.fishId);
  if (!fish) {
    return null;
  }

  const quality = Number(
    getRandomInRange(fish.qualityRange[0], fish.qualityRange[1], rng).toFixed(
      2,
    ),
  );
  const size = Number(
    getRandomInRange(fish.sizeRange[0], fish.sizeRange[1], rng).toFixed(2),
  );
  const difficultyScore = computeDifficulty(
    {
      baseDifficulty: fish.baseDifficulty,
      tier: fish.tier,
      quality,
      size,
    },
    location,
  );

  return {
    fishId: fish.id,
    fishName: fish.name,
    tier: fish.tier,
    quality,
    size,
    difficultyScore,
  };
};

export { computeDifficulty, rollEncounter };
