<template>
    <div class="game">
        <Boat :direction="lastHorDir" />

        <div class="game__hud">
            |(X:{{ boat.x.toFixed(0) }},Y:{{ boat.y.toFixed(0) }})|TYPE:
            {{ getCurrentZoneType }}|BALANCE:{{ balance }}
            |CURRENT POWER: {{ getGearPower.toFixed(2) }}|inMarket:{{ isInMarket }}
        </div>

        <Shop v-if="isInMarket" />

        <Zone v-for="zone in getNearbyZones" :key="`${zone.x},${zone.y}`" :zone="zone" :boat="boat" variant="fishing" />
        <Zone v-for="island in getNearbyIslands" :key="`${island.x},${island.y}`" :zone="island" :boat="boat"
            variant="island" />

        <FishingMinigame v-if="fishingActive" @catch="(payload) => handleCatch(payload)" :type="getCurrentZoneType" />
        <Inventory />

        <CurrentGear />

    </div>
</template>

<script>
import FishingMinigame from './FishingMinigame.vue'
import Inventory from './Inventory.vue'
import Boat from './Boat.vue'
import Zone from './Zone.vue'
import Shop from './Shop.vue'
import { getChunkCoords, getZoneType } from '../../fishZones.js'
import { mapState, mapActions, mapGetters } from 'vuex'
import { GEAR_MAP } from '@/gear'
import CurrentGear from './CurrentGear.vue'

const KEY_LEFT = 'ArrowLeft'
const KEY_RIGHT = 'ArrowRight'
const KEY_UP = 'ArrowUp'
const KEY_DOWN = 'ArrowDown'
const KEY_SPACE = ' '
const TICK_INTERVAL = 1000 / 60
const KEY_FEED = 'v'
export default {
    name: 'Game',
    components: { FishingMinigame, Inventory, Boat, Zone, Shop, CurrentGear },

    data() {
        return {
            keysPressed: {},
            timer: null,
            lastHorDir: 'right',
            fishingActive: false
        }
    },

    computed: {
        ...mapState(['boat', 'chunks', 'balance', 'ownedGear']),
        ...mapGetters(['getNearbyZones', 'getCurrentZoneType', 'getNearbyIslands', 'isInMarket', 'getGearPower']),

        chunk() {
            return getChunkCoords(this.boat.x, this.boat.y)
        }


    },

    methods: {
        ...mapActions(['moveBoat', 'updateChunks', 'addFish', 'spendBait', 'useFeed']),

        handleCatch({ success, fish }) {
            this.fishingActive = false
            if (success) {
                this.addFish(fish)
                this.spendBait()
            }
        },

        keyDown(event) {
            this.keysPressed[event.key] = true
            if (event.key === KEY_LEFT) this.lastHorDir = 'left'
            else if (event.key === KEY_RIGHT) this.lastHorDir = 'right'
            else if (event.key === KEY_SPACE && !this.fishingActive && !this.isInMarket) {
                this.fishingActive = true
            }
            
        },

        keyUp(event) {
            if (this.keysPressed[KEY_FEED]) this.useFeed()

            this.keysPressed[event.key] = false
        },

        gameLoop() {
            if (this.fishingActive) return
            if (this.keysPressed[KEY_UP]) this.moveBoat('up')
            if (this.keysPressed[KEY_DOWN]) this.moveBoat('down')
            if (this.keysPressed[KEY_LEFT]) this.moveBoat('left')
            if (this.keysPressed[KEY_RIGHT]) this.moveBoat('right')


        },

        lerp(a, b, t) {
            return a + (b - a) * t
        }
    },

    mounted() {
        window.addEventListener('keydown', this.keyDown)
        window.addEventListener('keyup', this.keyUp)
        this.timer = setInterval(this.gameLoop, TICK_INTERVAL)
        const { cx, cy } = this.chunk
        this.updateChunks({ cx, cy })
    },

    beforeUnmount() {
        window.removeEventListener('keydown', this.keyDown)
        window.removeEventListener('keyup', this.keyUp)
        clearInterval(this.timer)
    }
}
</script>

<style scoped lang="scss">
.game {
    position: relative;
    width: 1000px;
    height: 800px;
    border: 2px solid black;
    overflow: hidden;
    background: rgba(0, 0, 150, 1);

    &__hud {
        position: absolute;
        top: 10px;
        left: 10px;
        color: white;
        background: rgba(0, 0, 0, 0.5);
        padding: 4px 8px;
        border-radius: 4px;
    }
}
</style>