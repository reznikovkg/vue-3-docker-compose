
export const CHUNK_SIZE = 1000
export const MAX_ZONES_PER_CHUNK = 5
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

export function generateZonesForChunk(cx, cy) {
   const seed = getSeed(cx,cy)
   const rand = prng(seed)

    const zones = []
    const zoneCount = Math.floor(rand() * MAX_ZONES_PER_CHUNK) + 1 

    for (let i = 0; i < zoneCount; i++) {
       let currType = rand() > 0.8 ? FishZoneType.HIGH:FishZoneType.MEDIUM
        zones.push({
            x: cx * CHUNK_SIZE + rand() * CHUNK_SIZE,
            y: cy * CHUNK_SIZE + rand() * CHUNK_SIZE,
            radius: MIN_R + rand() * MAX_R,
            type: currType,
            used: false
        })
    }
    return zones
}

export function getZoneType(x, y,nearbyZones) {
 
    for (const zone of nearbyZones) {
            const dx = x - zone.x
            const dy = y - zone.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist <= zone.radius) return zone.type
    }
    return FishZoneType.LOW
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