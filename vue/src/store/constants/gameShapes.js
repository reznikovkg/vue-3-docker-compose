export const SHAPES = [
    {
        id: 'road',
        name: 'Road',
        color: 'gray',
        cost: 10,
        entryOffset: null,
        cells: [{x: 0, y: 0}]
    },
    {
        id: 'feed_zone',
        name: 'Feeding Zone',
        color: 'green',
        cost: 150,
        capacity: 3,
        entryOffset: {x: 0, y: 1},
        visitTime: 7,
        visitCost: 5,
        cells: [
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 0, y: 1}
        ]
    },
    {
        id: 'visitor_center',
        name: 'Visitor Center',
        color: 'yellow',
        cost: 200,
        capacity: 4,
        entryOffset: {x: 1, y: 1},
        visitTime: 3,
        visitCost: 5,
        cells: [
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 0, y: 1},
            {x: 1, y: 1}
        ]
    },
    {
        id: 'dino_arena',
        name: 'Raptor Arena',
        color: 'pink',
        cost: 400,
        capacity: 9,
        entryOffset: {x: 2, y: 2},
        visitTime: 10,
        visitCost: 25,
        cells: [
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0},
            {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1},
            {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}
        ]
    },
    {
        id: 'jungle_ride',
        name: 'Jungle Ride',
        color: 'orange',
        cost: 400,
        capacity: 4,
        entryOffset: {x: 3, y: 0},
        visitTime: 5,
        visitCost: 5,
        cells: [
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 2, y: 0},
            {x: 3, y: 0}
        ]
    },
    {
        id: 'observation_tower',
        name: 'Observation Tower',
        color: 'purple',
        cost: 300,
        capacity: 4,
        entryOffset: {x: 0, y: 3},
        visitTime: 5,
        visitCost: 10,
        cells: [
            {x: 0, y: 0},
            {x: 0, y: 1},
            {x: 0, y: 2},
            {x: 0, y: 3}
        ]
    },
    {
        id: 'jungle_maze',
        name: 'Jungle Maze',
        color: 'cyan',
        cost: 500,
        capacity: 6,
        entryOffset: {x: 0, y: 2},
        visitTime: 5,
        visitCost: 25,
        cells: [
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 2, y: 0},
            {x: 0, y: 1},
            {x: 1, y: 1},
            {x: 0, y: 2}
        ]
    },
    {
        id: 'rex_enclosure',
        name: 'T-Rex Enclosure',
        color: 'blue',
        cost: 250,
        capacity: 5,
        entryOffset: {x: 2, y: 2},
        visitTime: 5,
        visitCost: 20,
        cells: [
            {x: 0, y: 0},
            {x: 0, y: 1},
            {x: 0, y: 2},
            {x: 1, y: 2},
            {x: 2, y: 2}
        ]
    }
]