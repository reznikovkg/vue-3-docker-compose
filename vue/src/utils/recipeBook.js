const elements = {
  fire:   { name: "Огонь",    icon: "🔥" },
  water:  { name: "Вода",     icon: "💧" },
  earth:  { name: "Земля",    icon: "🌍" },
  air:    { name: "Воздух",   icon: "🌬️" },
  steam:  { name: "Пар",      icon: "💨" },
  mud:    { name: "Грязь",    icon: "🟤" },
  lava:   { name: "Лава",     icon: "🌋" },
  rain:   { name: "Дождь",    icon: "🌧️" },
  energy: { name: "Энергия",  icon: "⚡" },
  dust:   { name: "Пыль",     icon: "🌫️" },
  sea:    { name: "Море",     icon: "🌊" },
  stone:  { name: "Камень",   icon: "🪨" },
  sand:   { name: "Песок",    icon: "⏳" },
  glass:  { name: "Стекло",   icon: "🔷" },
  cloud:  { name: "Облако",   icon: "☁️" },
  storm:  { name: "Гроза",    icon: "🌩️" },
  plant:  { name: "Растение", icon: "🌱" },
  swamp:  { name: "Болото",   icon: "🪵" },
  life:   { name: "Жизнь",    icon: "🧬" },
  metal:  { name: "Металл",   icon: "⚙️" },
  beach:  { name: "Пляж",     icon: "🏖️" },
  ring:    { name: "Кольцо",   icon: "💍" },
  crystal: { name: "Кристалл", icon: "💎" },
  sword:   { name: "Меч",      icon: "⚔️" },
  golem:   { name: "Голем",    icon: "🗿" },
};

const startElements = ["fire", "water", "earth", "air"];

const recipes = [
  { ingredients: { fire: 1, water: 1 }, result: "steam" },
  { ingredients: { water: 1, earth: 1 }, result: "mud" },
  { ingredients: { fire: 1, earth: 1 }, result: "lava" },
  { ingredients: { water: 1, air: 1 }, result: "rain" },
  { ingredients: { fire: 1, air: 1 }, result: "energy" },
  { ingredients: { earth: 1, air: 1 }, result: "dust" },
  { ingredients: { water: 2 }, result: "sea" },
  { ingredients: { lava: 1, water: 1 }, result: "stone" },
  { ingredients: { stone: 1, water: 1 }, result: "sand" },
  { ingredients: { sand: 1, fire: 1 }, result: "glass" },
  { ingredients: { steam: 1, air: 1 }, result: "cloud" },
  { ingredients: { cloud: 1, energy: 1 }, result: "storm" },
  { ingredients: { rain: 1, earth: 1 }, result: "plant" },
  { ingredients: { mud: 1, plant: 1 }, result: "swamp" },
  { ingredients: { swamp: 1, energy: 1 }, result: "life" },
  { ingredients: { stone: 1, fire: 1 }, result: "metal" },
  { ingredients: { sand: 1, sea: 1 }, result: "beach" },
];

const craftRecipes = [
  {
    pattern: [
      "glass", "glass", "glass",
      "glass", null,    "glass",
      "glass", "glass", "glass",
    ],
    result: "ring",
  },
  {
    pattern: [
      null,    "glass",  null,
      "glass", "energy", "glass",
      null,    "glass",  null,
    ],
    result: "crystal",
  },
  {
    pattern: [
      null, "metal", null,
      null, "metal", null,
      null, "metal", null,
    ],
    result: "sword",
  },
  {
    pattern: [
      null,    "stone", null,
      "stone", "stone", "stone",
      "stone", null,    "stone",
    ],
    result: "golem",
  },
];

const getElement = (key) => {
  return elements[key];
};

const totalCount = () => {
  return Object.keys(elements).length;
};

const findRecipe = (table) => {
  const keys = Object.keys(table);
  return recipes.find((recipe) => {
    const ingredients = Object.keys(recipe.ingredients);
    return ingredients.length === keys.length &&
      ingredients.every((key) => recipe.ingredients[key] === table[key]);
  });
};

const findCraft = (slots) => {
  return craftRecipes.find((recipe) => {
    return recipe.pattern.every((key, index) => key === slots[index]);
  });
};

export default {
  elements,
  startElements,
  recipes,
  craftRecipes,
  getElement,
  totalCount,
  findRecipe,
  findCraft,
};
