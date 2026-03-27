import rod1Icon from '@/assets/gear/rod1.png'
import rod2Icon from '@/assets/gear/rod2.png'
import rod3Icon from '@/assets/gear/rod3.png'
import line1Icon from '@/assets/gear/line1.png'
import line2Icon from '@/assets/gear/line2.png'
import reel1Icon from '@/assets/gear/reel1.png'
import reel2Icon from '@/assets/gear/reel2.png'

export const GEAR_MAP = {
    // удочки
    rod1: {
        type: 'rod',
        name: 'Basic Rod',
        price: 0,
        power: 1,
        next: 'rod2',
        icon: rod1Icon
    },
    rod2: {
        type: 'rod',
        name: 'Better Rod',
        price: 100,
        power: 2.0,
        next: 'rod3',
        icon: rod2Icon
    },
    rod3: {
        type: 'rod',
        name: 'Best Rod',
        price: 300,
        power: 3.0,
        next: null,
        icon: rod3Icon
    },

    // лески
    line1: {
        type: 'line',
        name: 'Basic Line',
        price: 0,
        power: 1,
        next: 'line2',
        icon: line1Icon
    },
    line2: {
        type: 'line',
        name: 'Reinforced Line',
        price: 75,
        power: 1.5,
        next: null,
        icon: line2Icon
    },

    // катушки
    reel1: {
        type: 'reel',
        name: 'Basic Reel',
        price: 0,
        power: 0.9,
        next: 'reel2',
        icon: reel1Icon
    },
    reel2: {
        type: 'reel',
        name: 'Professional Reel',
        price: 90,
        power: 1.8,
        next: null,
        icon: reel2Icon
    }
}