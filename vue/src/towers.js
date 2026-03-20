export const TOWERS = {
    archer: {
        name: 'Лучник', color: '#00ff5c', cost: 50, refund: 25,
        levels: [
            { damage: 10, range: 100, fireRate: 1000, hp: 50 },
            { damage: 18, range: 130, fireRate: 850,  hp: 80 },
            { damage: 30, range: 160, fireRate: 650,  hp: 120 },
        ],
        upgradeCost: [75, 120],
    },
    rifle: {
        name: 'Стрелок', color: '#00ffd1', cost: 100, refund: 50,
        levels: [
            { damage: 30, range: 80,  fireRate: 2000, hp: 100 },
            { damage: 55, range: 110, fireRate: 1700, hp: 160 },
            { damage: 90, range: 140, fireRate: 1400, hp: 240 },
        ],
        upgradeCost: [130, 200],
    },
    sniper: {
        name: 'Снайпер', color: '#3f00f8', cost: 80, refund: 40,
        levels: [
            { damage: 15, range: 120, fireRate: 1200, hp: 60 },
            { damage: 28, range: 155, fireRate: 1000, hp: 100 },
            { damage: 48, range: 190, fireRate: 750,  hp: 150 },
        ],
        upgradeCost: [100, 160],
    },
}