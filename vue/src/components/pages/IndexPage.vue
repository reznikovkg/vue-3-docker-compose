<template>
  <div class="game" :style="mapStyle">
    <div class="game__zones">
      <div
        v-for="(c, i) in zones.medium"
        :key="'m'+i"
        class="zone zone--medium"
        :style="circleStyle(c)"
      ></div>
      <div
        v-for="(c, i) in zones.high"
        :key="'h'+i"
        class="zone zone--high"
        :style="circleStyle(c)"
      ></div>
    </div>
    <div class="game__islands">
      <div
        v-for="(island, i) in islands"
        :key="'shallow'+i"
        class="island island--shallow"
        :style="islandStyle(island.shallowRadius, island)"
      ></div>
      <div
        v-for="(island, i) in islands"
        :key="'island'+i"
        class="island island--land"
        :style="islandStyle(island.islandRadius, island)"
      ></div>
    </div>
    <div class="game__feeding">
      <div
        v-for="(spot, i) in feedingSpots"
        :key="'feed'+i"
        class="feed-spot"
        :class="'feed-spot--level-'+spot.level"
        :style="feedStyle(spot)"
      ></div>
    </div>
    <div class="game__top">
      <div>Позиция: {{ pos.x }} / {{ pos.y }}</div>
      <div>Зона: {{ zoneLabel }}</div>
      <div>Баланс: {{ balance }}</div>
    </div>
    <div class="game__top-actions">
      <button class="btn btn--small btn--reset" @click="handleResetGame">Начать заново</button>
    </div>
    <div class="game__left-bottom">
      <div class="controls">
        <button class="btn" @click="handleStartFishing" :disabled="waiting || active">Рыбачить</button>
        <div class="controls__row">Наживка: {{ currentBaitStock }}</div>
        <div class="controls__row">Прикормка: {{ groundbaitCount }}</div>
        <div v-if="waiting">Ждем поклевку...</div>
        <div class="controls__hint">Сбросить прикормку: F</div>
      </div>
      <FishingMiniGame :difficulty="miniDifficulty" v-if="active" @result="handleMiniResult" />
      <div class="bait-panel">
        <div class="bait-panel__title">Наживка</div>
        <button
          v-for="b in baitList"
          :key="b.id"
          class="btn btn--small"
          :class="{ 'btn--active': currentBaitId === b.id }"
          @click="handleSetBait(b.id)"
        >
          {{ b.name }} ({{ (inventory.baits?.[b.id] || 0) }})
        </button>
        <div class="bait-panel__hint">Выбор наживки влияет на вид рыбы</div>
      </div>
    </div>
    <div class="game__right">
      <InventoryPanel
        :inventory="inventory"
        :baits="baitList"
        :equipped="equippedTackle"
        :tackle="tackleList"
        :rod-power="rodPower"
      />
      <div class="market" v-if="isMarketNearby">
        <div class="market__title">Рынок (мелководье)</div>
        <div class="market__section">
          <div class="market__section-title">Продать рыбу</div>
          <button
            v-for="f in fishTypes"
            :key="f.id"
            class="btn btn--small"
            @click="handleSellFish(f.id, 1)"
            :disabled="inventory.fish?.[f.id] <= 0"
          >
            {{ f.name }} x1 (+{{ f.basePrice }})
          </button>
        </div>
        <div class="market__section">
          <div class="market__section-title">Купить наживку</div>
          <button
            v-for="b in baitList"
            :key="b.id"
            class="btn btn--small"
            @click="handleBuyBait(b.id, 5)"
            :disabled="balance < b.price * 5"
          >
            {{ b.name }} x5 (-{{ b.price * 5 }})
          </button>
        </div>
        <div class="market__section">
          <div class="market__section-title">Прикормка</div>
          <button class="btn btn--small" @click="handleBuyGroundbait(3)" :disabled="balance < groundbaitItem.price * 3">
            {{ groundbaitItem.name }} x3 (-{{ groundbaitItem.price * 3 }})
          </button>
        </div>
        <div class="market__section">
          <div class="market__section-title">Снасти</div>
          <div
            v-for="t in tackleList"
            :key="t.id"
            class="tackle-row"
            :class="{ 'tackle-row--owned': ownedTackleIds.includes(t.id), 'tackle-row--equipped': equippedTackle[t.type] === t.id }"
          >
            <span class="tackle-row__name">
              {{ t.name }} ({{ t.price }}) ×{{ t.power.toFixed(2) }}
            </span>
            <button
              class="btn btn--small"
              @click="handleBuyTackle(t.id)"
              :disabled="ownedTackleIds.includes(t.id) || balance < t.price || t.price <= 0"
            >
              Купить
            </button>
            <button
              class="btn btn--small"
              @click="handleEquipTackle(t.id)"
              :disabled="!ownedTackleIds.includes(t.id)"
            >
              Надеть
            </button>
            <button
              class="btn btn--small btn--warn"
              @click="handleSellTackle(t.id)"
              :disabled="!ownedTackleIds.includes(t.id) || t.price === 0"
            >
              Продать (+{{ sellPrice(t) }})
            </button>
          </div>
          <div class="market__rod-info">
            Мощность снастей: {{ rodPower.toFixed(2) }}
          </div>
        </div>
      </div>
    </div>
    <div class="game__boat">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <path d="M60 20 L60 70" stroke="#d63031" stroke-width="6" />
        <path d="M60 20 C90 30 90 70 60 70 Z" fill="none" stroke="#d63031" stroke-width="6" />
        <path d="M20 80 Q60 100 100 80" fill="none" stroke="#d63031" stroke-width="6" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import FishingMiniGame from '@/components/FishingMiniGame.vue'
import InventoryPanel from '@/components/InventoryPanel.vue'
import { BAITS, GROUNDBAIT_ITEMS, TACKLE_ITEMS, FISH_TYPES, type FishType, type TackleItem } from '@/store/game'

const store = useStore()

const pressed = ref<Record<string, boolean>>({})
const raf = ref(0)
const last = ref(0)
const speed = ref(240)
const waiting = ref(false)
const active = ref(false)
const miniDifficulty = ref(1)
const plannedFishId = ref<FishType['id'] | null>(null)

const baitList = BAITS
const groundbaitItem = GROUNDBAIT_ITEMS[0]
const tackleList = TACKLE_ITEMS
const fishTypes = FISH_TYPES

const pos = computed(() => store.getters['game/getPos'])
const inventory = computed(() => store.getters['game/getInventory'])
const zones = computed(() => store.getters['game/getZones'])
const zoneType = computed(() => store.getters['game/getZoneType'])
const zoneLabel = computed(() => store.getters['game/getZoneLabel'])
const balance = computed(() => store.getters['game/getBalance'])
const isMarketNearby = computed(() => store.getters['game/getIsMarketNearby'])
const currentBaitId = computed(() => store.getters['game/getCurrentBaitId'])
const rodPower = computed(() => store.getters['game/getRodPower'])
const ownedTackleIds = computed(() => store.getters['game/getOwnedTackleIds'])
const equippedTackle = computed(() => store.getters['game/getEquippedTackle'])
const islands = computed(() => store.getters['game/getIslands'])
const feedingSpots = computed(() => store.getters['game/getFeedingSpots'])
const feedLevel = computed(() => store.getters['game/getFeedLevel'])

const groundbaitCount = computed(() => inventory.value.groundbait || 0)
const currentBaitStock = computed(() => inventory.value.baits?.[currentBaitId.value] || 0)

const mapStyle = computed(() => {
  const x = -pos.value.x
  const y = -pos.value.y
  return {
    backgroundPosition: `${x}px ${y}px`
  }
})

const circleStyle = (c: any) => ({
  left: `calc(50% + ${c.x - pos.value.x}px)`,
  top: `calc(50% + ${c.y - pos.value.y}px)`,
  width: `${c.r * 2}px`,
  height: `${c.r * 2}px`
})

const islandStyle = (radius: number, island: { x: number; y: number }) => ({
  left: `calc(50% + ${island.x - pos.value.x}px)`,
  top: `calc(50% + ${island.y - pos.value.y}px)`,
  width: `${radius * 2}px`,
  height: `${radius * 2}px`
})

const feedStyle = (spot: { x: number; y: number; level: number }) => {
  const base = 150
  const r = base + spot.level * 25
  return {
    left: `calc(50% + ${spot.x - pos.value.x}px)`,
    top: `calc(50% + ${spot.y - pos.value.y}px)`,
    width: `${r * 2}px`,
    height: `${r * 2}px`
  }
}

const tick = (t: number) => {
  const dt = last.value ? (t - last.value) / 1000 : 0
  last.value = t
  
  if (active.value) {
    raf.value = requestAnimationFrame(tick)
    return
  }
  
  let dx = 0
  let dy = 0
  if (pressed.value.ArrowLeft) dx -= speed.value * dt
  if (pressed.value.ArrowRight) dx += speed.value * dt
  if (pressed.value.ArrowUp) dy -= speed.value * dt
  if (pressed.value.ArrowDown) dy += speed.value * dt
  
  if (dx || dy) {
    const newX = Math.round(pos.value.x + dx)
    const newY = Math.round(pos.value.y + dy)
    store.dispatch('game/moveBoat', { x: newX, y: newY })
  }
  
  raf.value = requestAnimationFrame(tick)
}

const onDown = (e: KeyboardEvent) => {
  pressed.value[e.key] = true
  if (e.key === 'f' || e.key === 'F') {
    e.preventDefault()
    store.dispatch('game/dropGroundbait')
  }
}

const onUp = (e: KeyboardEvent) => {
  pressed.value[e.key] = false
}

const chooseFishForCurrentBait = () => {
  const bait = BAITS.find((b) => b.id === currentBaitId.value) || BAITS[0]
  const pool = FISH_TYPES.filter((f) => bait.fishIds.includes(f.id))
  const list = pool.length ? pool : FISH_TYPES
  const type = zoneType.value
  const weights = list.map((fish) => {
    if (type === 'high') return fish.size * 1.6
    if (type === 'medium') return fish.size * 1.2
    return Math.max(1, 3 - fish.size * 0.2)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (let i = 0; i < list.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return list[i]
  }
  return list[0]
}

const handleStartFishing = () => {
  if (waiting.value || active.value) return
  if (currentBaitStock.value <= 0) return
  
  waiting.value = true
  const type = zoneType.value
  let delay = 0
  if (type === 'medium') delay = 1000 + Math.floor(Math.random() * 1000)
  if (type === 'low') delay = 3000 + Math.floor(Math.random() * 3000)

  const fish = chooseFishForCurrentBait()
  plannedFishId.value = fish.id
  const power = rodPower.value || 1
  const base = fish.size / power
  const feedDelayMod = feedLevel.value >= 3 ? 0.5 : feedLevel.value === 2 ? 0.65 : feedLevel.value === 1 ? 0.8 : 1
  const feedDiffMod = feedLevel.value >= 3 ? 0.75 : feedLevel.value === 2 ? 0.85 : feedLevel.value === 1 ? 0.95 : 1
  delay = Math.floor(delay * feedDelayMod)
  miniDifficulty.value = Math.min(2.6, Math.max(0.35, base * feedDiffMod))

  setTimeout(() => {
    waiting.value = false
    active.value = true
  }, delay)
}

const handleMiniResult = (ok: boolean) => {
  active.value = false
  if (ok && plannedFishId.value) {
    store.dispatch('game/catchFish', plannedFishId.value)
  }
  plannedFishId.value = null
}

const handleBuyBait = (id: string, count: number) => {
  store.dispatch('game/buyBait', { baitId: id, amount: count })
}

const handleBuyGroundbait = (count: number) => {
  store.dispatch('game/buyGroundbait', count)
}

const handleBuyTackle = (id: string) => {
  store.dispatch('game/buyTackle', id)
}

const handleSellTackle = (id: string) => {
  store.dispatch('game/sellTackle', id)
}

const handleEquipTackle = (id: string) => {
  store.dispatch('game/equipTackle', id)
}

const handleSellFish = (id: string, count: number) => {
  store.dispatch('game/sellFish', { fishId: id, amount: count })
}

const handleSetBait = (id: string) => {
  store.dispatch('game/setCurrentBait', id)
}

const handleResetGame = () => {
  store.dispatch('game/resetGame')
}

const sellPrice = (item: TackleItem) => Math.floor(item.price * 0.6)

onMounted(() => {
  raf.value = requestAnimationFrame(tick)
  window.addEventListener('keydown', onDown)
  window.addEventListener('keyup', onUp)
})

onUnmounted(() => {
  cancelAnimationFrame(raf.value)
  window.removeEventListener('keydown', onDown)
  window.removeEventListener('keyup', onUp)
})
</script>

<style scoped lang="less">
.game {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #8ed8f7;
  background-image: linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), 
                    linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px);
  background-size: 64px 64px, 64px 64px;
  overflow: hidden;

  &__zones {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__islands,
  &__feeding {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__top {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 16px;
    padding: 8px 12px;
    background: rgba(255,255,255,0.5);
    border-radius: 12px;
  }

  &__top-actions {
    position: absolute;
    top: 12px;
    right: 12px;
  }

  &__left-bottom {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__right {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__boat {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    margin: 0;
    padding: 0;
  }
}

.zone {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px dashed rgba(0,0,0,0.35);
  background: rgba(255,255,255,0.1);

  &--medium {
    border-color: rgba(241, 196, 15, 0.8);
    background: rgba(241, 196, 15, 0.15);
  }

  &--high {
    border-color: rgba(231, 76, 60, 0.85);
    background: rgba(231, 76, 60, 0.15);
  }
}

.island {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;

  &--shallow {
    border: 2px solid rgba(26, 188, 156, 0.7);
    background: rgba(26, 188, 156, 0.1);
  }

  &--land {
    background: rgba(44, 62, 80, 0.8);
    box-shadow: 0 0 12px rgba(0,0,0,0.35) inset;
  }
}

.feed-spot {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px dashed rgba(52, 152, 219, 0.8);
  background: rgba(52, 152, 219, 0.12);

  &--level-2 {
    border-color: rgba(46, 204, 113, 0.9);
    background: rgba(46, 204, 113, 0.14);
  }

  &--level-3 {
    border-color: rgba(231, 76, 60, 0.9);
    background: rgba(231, 76, 60, 0.14);
  }
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.5);
  border-radius: 12px;
  min-width: 180px;

  &__row {
    font-size: 12px;
  }

  &__hint {
    font-size: 11px;
    opacity: 0.8;
  }
}

.btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #e74c3c;
  color: #fff;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  &--small {
    padding: 4px 8px;
    font-size: 11px;
    border-radius: 6px;
    background: #3498db;
  }

  &--active {
    background: #2ecc71;
  }

  &--warn {
    background: #f39c12;
  }

  &--reset {
    background: #9b59b6;
    color: #fff;
  }
}

.bait-panel {
  padding: 8px 12px;
  background: rgba(255,255,255,0.5);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  max-width: 200px;

  &__title {
    font-weight: 600;
    font-size: 13px;
  }

  &__hint {
    font-size: 11px;
    opacity: 0.8;
  }
}

.market {
  padding: 10px 12px;
  background: rgba(255,255,255,0.7);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 320px;
  max-height: 72vh;
  overflow-y: auto;

  &__title {
    font-weight: 700;
    margin-bottom: 4px;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__section-title {
    font-weight: 600;
    font-size: 13px;
  }

  &__rod-info {
    margin-top: 4px;
    font-size: 12px;
  }
}

.tackle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  font-size: 11px;
  padding: 4px 6px;
  border-radius: 6px;

  &--owned {
    background: rgba(46, 204, 113, 0.08);
  }

  &--equipped {
    box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.5);
  }

  &__name {
    flex: 1;
  }
}
</style>
