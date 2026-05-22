import greenFish from '../assets/images/fish/green.png'
import blueFish from '../assets/images/fish/blue.png'
import redFish from '../assets/images/fish/red.png'
import worm from '../assets/images/bait/worm.png'
import caterpillar from '../assets/images/bait/caterpillar.png'
import crab from '../assets/images/bait/crab.png'
import feed from '../assets/images/bait/feed.png'
import bambooRod from '../assets/images/tackle/rod/bamboo.png'
import woodRod from '../assets/images/tackle/rod/wood.png'
import carbonRod from '../assets/images/tackle/rod/carbon.png'
import basicReel from '../assets/images/tackle/reel/basic.png'
import blueReel from '../assets/images/tackle/reel/blue.png'
import redReel from '../assets/images/tackle/reel/red.png'
import basicHook from '../assets/images/tackle/hook/basic.png'
import blueHook from '../assets/images/tackle/hook/blue.png'
import goldHook from '../assets/images/tackle/hook/gold.png'

export const FISH_TYPES = [
  {name: 'green fish', image: greenFish, minWeight: 1, maxWeight: 6, pricePerKg: 2},
  {name: 'blue fish', image: blueFish, minWeight: 8, maxWeight: 24, pricePerKg: 3},
  {name: 'red fish', image: redFish, minWeight: 27, maxWeight: 81, pricePerKg: 4}
]

export const TACKLE_TYPES = [
  {name: 'bamboo rod', image: bambooRod, level: 1, price: 0, type: 'rod'},
  {name: 'wood rod', image: woodRod, level: 2, price: 250, type: 'rod'},
  {name: 'carbon rod', image: carbonRod, level: 3, price: 1000, type: 'rod'},
  {name: 'basic reel', image: basicReel, level: 1, price: 0, type: 'reel'},
  {name: 'blue reel', image: blueReel, level: 2, price: 100, type: 'reel'},
  {name: 'red reel', image: redReel, level: 3, price: 1000, type: 'reel'},
  {name: 'basic hook', image: basicHook, level: 1, price: 0, type: 'hook'},
  {name: 'blue hook', image: blueHook, level: 2, price: 50, type: 'hook'},
  {name: 'gold hook', image: goldHook, level: 3, price: 1000, type: 'hook'}
]

export const BAIT_TYPES = [
  {name: 'worm', image: worm, level: 0, price: 2, type: 'fishing'},
  {name: 'caterpillar', image: caterpillar, level: 1, price: 6, type: 'fishing'},
  {name: 'crab', image: crab, level: 2, price: 12, type: 'fishing'},
  {name: 'feed', image: feed, level: 0, price: 10, type: 'feeding'}
]
