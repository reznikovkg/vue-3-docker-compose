import blueImg from '@/assets/bubbles/blue.png'
import greenImg from '@/assets/bubbles/green.png'
import orangeImg from '@/assets/bubbles/orange.png'
import pinkImg from '@/assets/bubbles/pink.png'
import purpleImg from '@/assets/bubbles/purple.png'
import redImg from '@/assets/bubbles/red.png'
import yellowImg from '@/assets/bubbles/yellow.png'

export const RADIUS = {
    small: 25,
    medium: 40,
    large: 60
}

export const WRONG_PENALTIES = {
    small: -1,
    medium: -3,
    large: -5
}

export const ESCAPE_PENALTIES = {
    small: -3,
    medium: -6,
    large: -10
}

export const PUSH_FACTORS = {
    large: {
        large: 1,
        medium: 1.5,
        small: 2
    },
    medium: {
        large: 0.5,
        medium: 1,
        small: 1.5
    },
    small: {
        large: 0.25,
        medium: 0.5,
        small: 1
    }
}

/**
 * @type {Record<string, string>}
 */
export const COLOR_IMAGES = {
    blue: blueImg,
    green: greenImg,
    orange: orangeImg,
    pink: pinkImg,
    purple: purpleImg,
    red: redImg,
    yellow: yellowImg
}

/**
 * @type {Record<string, string>}
 */
export const COLOR_NAMES = {
    blue: 'Синий',
    green: 'Зелёный',
    orange: 'Оранжевый',
    pink: 'Розовый',
    purple: 'Фиолетовый',
    red: 'Красный',
    yellow: 'Жёлтый'
}

/** @type {string[]} */
export const COLOR_LIST = Object.keys(COLOR_IMAGES)