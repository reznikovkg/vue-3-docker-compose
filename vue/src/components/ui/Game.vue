<template>
    <div class="game">
        <Boat :direction="lastHorDir" />

        <div class="game__hud">
            Coords:(X: {{ boat.x.toFixed(0) }}, Y: {{ boat.y.toFixed(0) }}) TYPE: {{ currentType }}
        </div>

        <Zone v-for="zone in zones" :key="`${zone.x},${zone.y}`" :zone="zone" :boat="boat" />

        <FishingMinigame 
            v-if="fishingActive" 
            @catch="handleCatch" 
            :type="currentType" 
        />
        <Inventory />
    </div>
</template>

<script>
import FishingMinigame from './FishingMinigame.vue'
import Inventory from './Inventory.vue'
import Boat from './Boat.vue'
import Zone from './Zone.vue'
import { getChunkCoords, getZoneType } from '../../fishZones.js'

const KEY_LEFT = 'ArrowLeft'
const KEY_RIGHT = 'ArrowRight'
const KEY_UP = 'ArrowUp'
const KEY_DOWN = 'ArrowDown'
const KEY_SPACE = ' '

export default {
    name: 'Game',
    components: { FishingMinigame, Inventory, Boat, Zone },

    data() {
        return {
            keysPressed: {},
            timer: null,
            lastHorDir: 'right',
            fishingActive: false
        }
    },

    computed: {
        boat() {
            return this.$store.getters.getBoat
        },
        chunk() {
            return getChunkCoords(this.boat.x, this.boat.y)
        },
        chunkKey() {
            const { cx, cy } = getChunkCoords(this.boat.x, this.boat.y)
            return `${cx},${cy}`
        },
        tickInterval() {
            return this.$store.getters.getTickInterval
        },
        chunks() {
            return this.$store.state.chunks
        },
        zones() {
            return Object.values(this.chunks).flatMap(chunk => chunk.zones)
        },
        currentType() {
            return getZoneType(this.boat.x, this.boat.y, this.zones)
        }
    },

    methods: {
        handleCatch(success) {
            this.fishingActive = false
        },

        keyDown(event) {
            this.keysPressed[event.key] = true

            if (event.key === KEY_LEFT) this.lastHorDir = 'left'
            else if (event.key === KEY_RIGHT) this.lastHorDir = 'right'
            else if (event.key === KEY_SPACE && !this.fishingActive) {
                this.fishingActive = true
            }
        },

        keyUp(event) {
            this.keysPressed[event.key] = false
        },

        gameLoop() {
            if (this.fishingActive) return

            if (this.keysPressed[KEY_UP]) this.$store.dispatch('moveBoat', 'up')
            if (this.keysPressed[KEY_DOWN]) this.$store.dispatch('moveBoat', 'down')
            if (this.keysPressed[KEY_LEFT]) this.$store.dispatch('moveBoat', 'left')
            if (this.keysPressed[KEY_RIGHT]) this.$store.dispatch('moveBoat', 'right')
        },

        lerp(a, b, t) {
            return a + (b - a) * t
        }
    },

    mounted() {
        window.addEventListener('keydown', this.keyDown)
        window.addEventListener('keyup', this.keyUp)

        this.timer = setInterval(() => this.gameLoop(), this.tickInterval)

        const { cx, cy } = this.chunk
        this.$store.dispatch('updateChunks', { cx, cy })
    },

    beforeUnmount() {
        window.removeEventListener('keydown', this.keyDown)
        window.removeEventListener('keyup', this.keyUp)
        clearInterval(this.timer)
    }
}
</script>

<style scoped>
.game {
    position: relative;
    width: 1000px;
    height: 800px;
    border: 2px solid black;
    overflow: hidden;
    background: rgba(0, 0, 150, 1);
}

.game__hud {
    position: absolute;
    bottom: 10px;
    left: 10px;
    color: white;
    background: rgba(0, 0, 0, 0.5);
    padding: 4px 8px;
    border-radius: 4px;
}
</style>