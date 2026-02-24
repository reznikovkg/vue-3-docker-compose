import colaImg from "../assets/cola_icon.png";
import coffeeImg from "../assets/coffee_icon.png";
import cupcakeImg from "../assets/cupcake_icon.png";
import friesImg from "../assets/fries_icon.png";
import icecreamImg from "../assets/icecream_icon.png";
import pizzaImg from "../assets/pizza_icon.png";
import pumpkinImg from "../assets/pumpkin_icon.png";
import steakImg from "../assets/steak_icon.png";
import sushiImg from "../assets/sushi_icon.png";
import tacoImg from "../assets/taco_icon.png";

export const TITLES = [
  "Cola",
  "Coffee",
  "Cupcake",
  "Fries",
  "Icecream",
  "Pizza",
  "Pumpkin",
  "Steak",
  "Sushi",
  "Taco",
];

export const IMAGES = [
  colaImg,
  coffeeImg,
  cupcakeImg,
  friesImg,
  icecreamImg,
  pizzaImg,
  pumpkinImg,
  steakImg,
  sushiImg,
  tacoImg,
];

export const createCards = (cardCount) => {
  const cards = [];
  const pairsCount = cardCount / 2;

  const usedImages = IMAGES.slice(0, pairsCount);
  const usedTitles = TITLES.slice(0, pairsCount);

  usedImages.forEach((image, index) => {
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: `${Date.now()}-${Math.random()}`,
        title: usedTitles[index],
        image: image,
        isFaceUp: false,
        isFounded: false,
        pairId: index,
      });
    }
  });

  return shuffleCards(cards);
};

export const shuffleCards = (cards) => {
  const shuffled = [];
  const usedCards = [];
  while (shuffled.length < cards.length) {
    let cardIndex = Math.floor(Math.random() * cards.length);
    if (!usedCards.includes(cardIndex)) {
      let currentCard = { ...cards[cardIndex], isFaceUp: false };
      usedCards.push(cardIndex);
      shuffled.push(currentCard);
    }
  }
  return shuffled;
};

export const isGameComplete = (cards) => {
  return cards.every((card) => card.isFounded);
};
