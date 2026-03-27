// consumables.js
import wormIcon from '@/assets/consumables/worm.png'
import sardineIcon from '@/assets/consumables/sardine.png'
import feedIcon from '@/assets/consumables/feed.png'

export const CONSUMABLES_MAP = {
    worm: {
        id: 'worm',
        name: 'Worm',
        type: 'bait',
        icon: wormIcon,
        price: 0,
        effect: {
            catchableFish: ['Tuna', 'Catfish'],
            bonusPower: 1
        }
    },
    sardine: {
        id: 'sardine',
        name: 'Sardine',
        type: 'bait',
        icon: sardineIcon,
        price: 5,
        effect: {
            catchableFish: ['Goldfish'],
            bonusPower: 2.0
        }
    },
    feed: {
        id: 'feed',
        name: 'Feed',
        type: 'feed',
        icon: feedIcon,
        price: 50,
        effect: {
            zoneIncreasePower: 1
        }
    }
};