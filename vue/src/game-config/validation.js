const isFiniteNumber = (value) => Number.isFinite(value);
const isPercentage = (value) =>
  isFiniteNumber(value) && value >= 0 && value <= 100;

const validateLocation = (location) => {
  const errors = [];

  if (!location || typeof location !== 'object') {
    errors.push('location must be an object');
    return errors;
  }

  if (!location.id || typeof location.id !== 'string') {
    errors.push('location.id must be a non-empty string');
  }

  if (!location.name || typeof location.name !== 'string') {
    errors.push('location.name must be a non-empty string');
  }

  if (!location.bgImage || typeof location.bgImage !== 'string') {
    errors.push('location.bgImage must be a non-empty string');
  }

  if (!location.fishTableId || typeof location.fishTableId !== 'string') {
    errors.push('location.fishTableId must be a non-empty string');
  }

  if (!isFiniteNumber(location.biteRateBase)) {
    errors.push('location.biteRateBase must be a number');
  }

  if (
    location.difficultyMultiplier !== undefined &&
    !isFiniteNumber(location.difficultyMultiplier)
  ) {
    errors.push('location.difficultyMultiplier must be a number');
  }

  if (!location.bobberAnchor || typeof location.bobberAnchor !== 'object') {
    errors.push('location.bobberAnchor must be an object');
  } else {
    if (!isPercentage(location.bobberAnchor.x)) {
      errors.push(
        'location.bobberAnchor.x must be a percentage between 0 and 100',
      );
    }

    if (!isPercentage(location.bobberAnchor.y)) {
      errors.push(
        'location.bobberAnchor.y must be a percentage between 0 and 100',
      );
    }
  }

  return errors;
};

const validateFish = (fish) => {
  const errors = [];

  if (!fish || typeof fish !== 'object') {
    errors.push('fish definition must be an object');
    return errors;
  }

  if (!fish.id || typeof fish.id !== 'string') {
    errors.push('fish.id must be a non-empty string');
  }

  if (!fish.name || typeof fish.name !== 'string') {
    errors.push('fish.name must be a non-empty string');
  }

  if (!isFiniteNumber(fish.tier)) {
    errors.push('fish.tier must be a number');
  }

  if (
    !Array.isArray(fish.qualityRange) ||
    fish.qualityRange.length !== 2 ||
    !fish.qualityRange.every(isFiniteNumber)
  ) {
    errors.push('fish.qualityRange must be [number, number]');
  }

  if (
    !Array.isArray(fish.sizeRange) ||
    fish.sizeRange.length !== 2 ||
    !fish.sizeRange.every(isFiniteNumber)
  ) {
    errors.push('fish.sizeRange must be [number, number]');
  }

  if (!isFiniteNumber(fish.baseDifficulty)) {
    errors.push('fish.baseDifficulty must be a number');
  }

  if (!isFiniteNumber(fish.sellValueBase)) {
    errors.push('fish.sellValueBase must be a number');
  }

  return errors;
};

const validateTuning = (tuning) => {
  const errors = [];

  if (!tuning || typeof tuning !== 'object') {
    errors.push('tuning must be an object');
    return errors;
  }

  if (
    !tuning.biteDelayMs ||
    !isFiniteNumber(tuning.biteDelayMs.min) ||
    !isFiniteNumber(tuning.biteDelayMs.max)
  ) {
    errors.push('tuning.biteDelayMs must have numeric min/max');
  }

  if (
    !tuning.minigame ||
    !isFiniteNumber(tuning.minigame.greenSpeedBase) ||
    !isFiniteNumber(tuning.minigame.redSpeedBase) ||
    !isFiniteNumber(tuning.minigame.maxTimeMs)
  ) {
    errors.push('tuning.minigame must have numeric core values');
  }

  return errors;
};

export const validateGameConfig = ({
  locations,
  fishDefinitions,
  fishTables,
  tuning,
}) => {
  const errors = [];

  if (!Array.isArray(locations) || locations.length === 0) {
    errors.push('locations must be a non-empty array');
  } else {
    locations.forEach((location, index) => {
      const locationErrors = validateLocation(location);
      locationErrors.forEach((message) => {
        errors.push(`locations[${index}]: ${message}`);
      });
    });
  }

  if (!Array.isArray(fishDefinitions) || fishDefinitions.length === 0) {
    errors.push('fishDefinitions must be a non-empty array');
  } else {
    fishDefinitions.forEach((fish, index) => {
      const fishErrors = validateFish(fish);
      fishErrors.forEach((message) => {
        errors.push(`fishDefinitions[${index}]: ${message}`);
      });
    });
  }

  if (
    !fishTables ||
    typeof fishTables !== 'object' ||
    Array.isArray(fishTables)
  ) {
    errors.push('fishTables must be an object');
  } else {
    locations.forEach((location) => {
      if (!fishTables[location.fishTableId]) {
        errors.push(`missing fish table for location ${location.id}`);
      }
    });
  }

  const tuningErrors = validateTuning(tuning);
  tuningErrors.forEach((message) => {
    errors.push(`tuning: ${message}`);
  });

  return errors;
};
