import tunaIcon from './assets/fish/tuna.png'
import catfishIcon from './assets/fish/catfish.png'
import goldfishIcon from './assets/fish/goldfish.png'
import { CONSUMABLES_MAP } from './consumables'

export const FISH_LIST = [
  {
    name: 'Tuna',
    icon: tunaIcon,
    weight: 1,
    mass: 3,
    price: 10
  },
  {
    name: 'Catfish',
    icon: catfishIcon,
    weight: 1.5,
    mass: 5,
    price: 40
  },
  {
    name: 'Goldfish',
    icon: goldfishIcon,
    weight: 110.2,
    mass: 1,
    price: 80
  }
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

export function getFishByBait(baitId) {
  const bait = CONSUMABLES_MAP[baitId]
  const catchable = FISH_LIST.filter((fish) => bait.effect.catchableFish.includes(fish.name))
  const weight = catchable.reduce((sum, fish) => sum + fish.weight, 0)
  
  let roll = Math.random() * weight
  for (const fish of catchable) {
    if (roll < fish.weight) return fish
    roll -= fish.weight
  }
  return catchable[catchable - 1]

}