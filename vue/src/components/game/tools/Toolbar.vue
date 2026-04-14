<template>
  <div class="toolbar">
    <div class="toolbar__modes">
      <button
          class="toolbar__button toolbar__button--build"
          :class="{ 'toolbar__button--active': mode === 'build' }"
          @click="setMode('build')"
      >
        Build
      </button>

      <button
          class="toolbar__button toolbar__button--delete"
          :class="{ 'toolbar__button--active': mode === 'delete' }"
          @click="setMode('delete')"
      >
        Delete
      </button>

    </div>

    <div class="toolbar__grid-size"
         :class="{ 'toolbar__is-disabled': mode === 'delete' }"
    >

      <div class="toolbar__row">
        <span>Width:</span>

        <div class="toolbar__stepper">
          <button @click="decWidth">-</button>
          <span>
            {{ localWidth }}
            <small class="toolbar__cost">(+{{ widthIncreaseCost }}$)</small>
          </span>
          <button @click="incWidth">+</button>
        </div>
      </div>

      <div class="toolbar__row">
        <span>Height:</span>

        <div class="toolbar__stepper">
          <button @click="decHeight">-</button>
          <span>
            {{ localHeight }}
            <small class="toolbar__cost">(+{{ heightIncreaseCost }}$)</small>
          </span>
          <button @click="incHeight">+</button>
        </div>
      </div>

    </div>
  </div>

  <ShapeList :class="{ 'toolbar__is-disabled': mode === 'delete' }"/>
</template>

<script setup>
import {computed, ref, watch} from 'vue'
import {useStore} from 'vuex'
import ShapeList from "@/components/game/tools/ShapeList.vue";

const store = useStore()

const balance = computed(() => store.getters.stats.balance)

const CELL_COST = 5

const canAfford = (cost) => balance.value >= cost

const mode = computed(() => store.getters.mode)

const setMode = mode => store.dispatch('setMode', mode)

const widthIncreaseCost = computed(() => localHeight.value * CELL_COST)
const heightIncreaseCost = computed(() => localWidth.value * CELL_COST)

const incWidth = () => {
  const cost = localHeight.value * CELL_COST

  if (!canAfford(cost)) {
    alert('Недостаточно средств, чтобы увеличить сетку')
    return
  }

  localWidth.value++
  store.dispatch('decreaseBalance', cost)

  applyResize()
}

const decWidth = () => {
  if (localWidth.value <= 8) {
    return
  }

  const refund = localHeight.value * CELL_COST * 0.5

  localWidth.value--
  store.dispatch('increaseBalance', refund)

  applyResize()
}

const incHeight = () => {
  const cost = localWidth.value * CELL_COST

  if (!canAfford(cost)) {
    alert('Недостаточно средств, чтобы увеличить сетку')
    return
  }

  localHeight.value++
  store.dispatch('decreaseBalance', cost)

  applyResize()
}

const decHeight = () => {
  if (localHeight.value <= 8) {
    return
  }

  const refund = localWidth.value * CELL_COST * 0.5

  localHeight.value--
  store.dispatch('increaseBalance', refund)

  applyResize()
}

const localWidth = ref(store.getters.width)
const localHeight = ref(store.getters.height)

watch(() => store.getters.width, v => localWidth.value = v)
watch(() => store.getters.height, v => localHeight.value = v)

const applyResize = () => {
  store.dispatch('resizeGrid', {
    width: localWidth.value,
    height: localHeight.value
  })
      .then(res => {
        if (!res.ok) {
          alert(res.message)

          localWidth.value = store.getters.width
          localHeight.value = store.getters.height
        }
      })
}
</script>

<style lang="less" scoped>
.is-disabled {
  opacity: 0.4;
  pointer-events: none;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #000;

  &__is-disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  &__modes {
    display: flex;
    gap: 10px;
  }

  &__button {
    padding: 12px 18px;
    font-size: 16px;
    border-radius: 12px;
    border: none;

    color: #000;
    cursor: pointer;

    opacity: 0.6;
    transition: 0.2s;

    &:hover {
      opacity: 0.8;
    }

    &:active {
      transform: scale(0.96);
    }

    &--active {
      opacity: 1;
    }

    &--build {
      background: #1677ff;
    }

    &--delete {
      background: #ff4d4f;
    }
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__stepper {
    display: flex;
    align-items: center;
    gap: 8px;

    button {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      background: #eee;
      font-weight: bold;
    }

    span {
      min-width: 24px;
      text-align: center;
      color: #000000;
    }
  }
}
</style>
