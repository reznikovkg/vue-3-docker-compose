import tunaIcon from './assets/fish/tuna.png'
import catfishIcon from './assets/fish/catfish.png'
import goldfishIcon from './assets/fish/goldfish.png'

export const FISH_LIST = [
  { name: 'Tuna', icon: tunaIcon, weight: 1 },
  { name: 'Catfish', icon: catfishIcon, weight: 3 },
  { name: 'Goldfish', icon: goldfishIcon, weight: 0.2 }
]

const TOTAL_WEIGHT = FISH_LIST.reduce((sum, fish) => sum + fish.weight, 0)


export function getRandomFish() {
  let roll = Math.random() * TOTAL_WEIGHT
  for (const fish of FISH_LIST) {
    if (roll < fish.weight) return fish
    roll -= fish.weight
  }
  return FISH_LIST[FISH_LIST.length - 1] 
}