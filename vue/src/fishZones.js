
const CHUNK_SIZE = 1000
const MAX_ZONES_PER_CHUNK = 5
export const MARKET_RANGE_COEFF = 2.5
const HIGH_ZONE_CHANCE = 0.25
const ISLAND_APPEAR_CHANCE = 0.5
const MIN_R = 10
const MAX_R = 100

export const FishZoneType = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
}

export function getChunkCoords(x, y) {
    return {
        cx: Math.floor(x / CHUNK_SIZE),
        cy: Math.floor(y / CHUNK_SIZE)
    }
}
export function generateZone(x,y){
    return {
            x,
            y,
            radius: MIN_R + Math.random() * MAX_R,
            type: FishZoneType.MEDIUM,
            upgraded: 0
        }
}
export function generateZonesForChunk(cx, cy) {
    const seed = getSeed(cx, cy)
    const rand = prng(seed)

    const zones = []
    const zoneCount = Math.floor(rand() * MAX_ZONES_PER_CHUNK) + 1

    for (let i = 0; i < zoneCount; i++) {
        let currType = rand() < HIGH_ZONE_CHANCE ? FishZoneType.HIGH : FishZoneType.MEDIUM
        zones.push({
            x: cx * CHUNK_SIZE + rand() * CHUNK_SIZE,
            y: cy * CHUNK_SIZE + rand() * CHUNK_SIZE,
            radius: MIN_R + rand() * MAX_R,
            type: currType,
            upgraded: 0

        })
    }
    return zones
}
export function generateIslandsForChunk(cx, cy) {
    const seed = getSeed(cx, cy) + 1000
    const rand = prng(seed)

    const islands = []

    if (rand() < ISLAND_APPEAR_CHANCE)
        islands.push({
            x: cx * CHUNK_SIZE + rand() * CHUNK_SIZE,
            y: cy * CHUNK_SIZE + rand() * CHUNK_SIZE,
            radius: MIN_R + rand() * MAX_R
        })
    return islands
}

export function getZoneType(x, y, nearbyZones) {
    for (const zone of nearbyZones) {
        const dx = x - zone.x
        const dy = y - zone.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= zone.radius) {
            console.log(`IN ${zone.type} ZONE`)
            return zone.type
        }
    }
    return FishZoneType.LOW
}

export function isInsideIsland(x, y, islands) {
    for (const island of islands) {
        const dx = x - island.x
        const dy = y - island.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= island.radius) return true
    }
    return false
}
export function isInMarket(x, y, islands) {
    for (const island of islands) {
        const dx = x - island.x
        const dy = y - island.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= island.radius * MARKET_RANGE_COEFF) return true
    }
    return false
}
export function findClosestZone(x, y, nearbyZones) {
    let best = {dist: Infinity}
    for (const zone of nearbyZones) {
        const dx = x - zone.x
        const dy = y - zone.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= best.dist) {
            best = {dist: dist, zone: zone}
        }
    }
    return best
}

function prng(seed) {
    return function () {
        let t = seed += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
}

function getSeed(cx, cy) {
    return cx * 73856093 ^ cy * 19349663
}