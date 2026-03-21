<template>
  <div class="home">
    <h1>Water Sort Puzzle</h1>
    <div class="flasks-container">
      <Flask
        v-for="(flask, index) in flasks"
        :key="index"
        :layers="flask.layers"
        :is-selected="selectedFlaskIndex === index"
        :flask-index="index"
        @flask-click="handleFlaskClick"
      />
    </div>
    <div class="win-counter">
      Серия побед: {{ winCount }}
    </div>
    <div>
      <button @click="resetGame" class="reset-btn">Сброс</button>
    </div>
    <div>
      Время: 
      <Timer ref="timer" />
    </div>
    <RouterLink :to="{ name: $routes.SETTING }">
      Настройки
    </RouterLink>
    <RouterLink :to="{ name: $routes.RECORD }">
      Рекорды
    </RouterLink>
    <div v-if="showWinMessage" class="win-message">
      Победа
    </div>
  </div>
</template>

<script setup>
import Flask from '@/components/Flask.vue'
import Timer from '@/components/Timer.vue'
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const FLASK_COUNT = computed(() => store.getters.getFlaskCount)
const LAYERS_PER_FLASK = computed(() => store.getters.getLayersPerFlask)
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
const selectedFlaskIndex = ref(null)
const flasks = ref([])
const timer = ref(null)
const showWinMessage = ref(false)
const winCount = computed(() => store.getters.getWinCount)
const curPercent = ref(Math.floor(100 / LAYERS_PER_FLASK.value))

onMounted(() => {
  newGame()
})

const handleFlaskClick = (index) => {
  if (selectedFlaskIndex.value === null) {
    selectedFlaskIndex.value = index
    return
  }
  if (selectedFlaskIndex.value === index) {
    selectedFlaskIndex.value = null
    return
  }
  pour(selectedFlaskIndex.value, index)
  selectedFlaskIndex.value = null
}

const getAvailableSpace = (flask) =>
  flask.layers.length === 0 
    ? curPercent.value * LAYERS_PER_FLASK.value
    : curPercent.value * LAYERS_PER_FLASK.value
      - flask.layers.reduce((sum, layer) => sum + layer.percent, 0)

const pour = (fromIndex, toIndex) => {
  const fromFlask = flasks.value[fromIndex]
  const toFlask = flasks.value[toIndex]

  if (fromFlask.layers.length === 0) return

  const topLayer = fromFlask.layers[fromFlask.layers.length - 1]

  const availableSpace = getAvailableSpace(toFlask)
  if (availableSpace === 0) {
    return
  }
      
  if (availableSpace < curPercent.value * LAYERS_PER_FLASK.value) {
    const toTopLayer = toFlask.layers[toFlask.layers.length - 1]
    if (toTopLayer.color !== topLayer.color) {
      return
    }
  }

  const pourAmount = Math.min(topLayer.percent, availableSpace)

  if (topLayer.percent === pourAmount) {
    fromFlask.layers.pop()
  } else {
    topLayer.percent -= pourAmount
  }

  if (toFlask.layers.length === 0) {
    toFlask.layers.push({
      color: topLayer.color,
      percent: pourAmount
    })
  } else {
    const toTopLayer = toFlask.layers[toFlask.layers.length - 1]
    toTopLayer.percent += pourAmount
  }

  if (checkWin()) {
    timer.value.stop()
    const time = timer.value.getTime()
    console.log('Победа за ', time, 'секунд')
    showWinMessage.value = true
    setTimeout(() => {
      showWinMessage.value = false
      newGame()
    }, 2000)
    store.commit('INC_WIN_COUNT')
  }
}

const fillRandomFlask = (flask, mapColors, mapCounts) => {
  const layers = []
  let fullness = 0
  while (fullness < LAYERS_PER_FLASK.value) {
    let colorIndex = Math.floor(Math.random() * mapColors.length)
    let rndParts = mapCounts[colorIndex] != 1 ?
      Math.min(
        Math.floor(Math.random() * (mapCounts[colorIndex] - 1) + 1),
        LAYERS_PER_FLASK.value - fullness
      ) : 1

    if (layers.length > 0 && layers[layers.length - 1].color === mapColors[colorIndex]) {
      layers[layers.length - 1].percent += curPercent.value * rndParts
    } else {
      layers.push({
        color: mapColors[colorIndex],
        percent: curPercent.value * rndParts
      })
    }
    fullness += rndParts
    mapCounts[colorIndex] -= rndParts
    if (mapCounts[colorIndex] === 0) {
      mapColors.splice(colorIndex, 1)
      mapCounts.splice(colorIndex, 1)
    }
  }
  flask.layers = layers
}

const lastFluskLayers = (mapColors, mapCounts) => {
  const layers = []
  for (let i = 0; i < mapColors.length; i++) {
    layers.push({
      color: mapColors[i],
      percent: curPercent.value * mapCounts[i]
    })
  }

  let i = 1
  while (i < layers.length) {
    if (layers[i].color === layers[i - 1].color) {
      layers[i - 1].percent += layers[i].percent
      layers.splice(i, 1)
    } else {
      i += 1
    }
  }
  return layers
}

const generateRandomFlasks = () => {
  let fullFlasks = FLASK_COUNT.value <= 5 ? FLASK_COUNT.value - 1 :
    (FLASK_COUNT.value <= 11 ? FLASK_COUNT.value - 2 : FLASK_COUNT.value - 3)

  const mapColors = Array(fullFlasks).fill().map(() =>
    COLORS[Math.floor(Math.random() * COLORS.length)]
  )
  const mapCounts = Array(fullFlasks).fill().map(() => LAYERS_PER_FLASK.value)

  const newFlasks = Array(fullFlasks - 1).fill().map(() => {
    const flask = { layers: [] }
    fillRandomFlask(flask, mapColors, mapCounts)
    return flask
  })
  
  newFlasks.push( {layers: lastFluskLayers(mapColors, mapCounts)} )

  newFlasks.push(
    ...Array(FLASK_COUNT.value - fullFlasks).fill().map(() => ({layers: []}))
  )

  return newFlasks
}

const checkWin = () => 
  flasks.value.every(flask =>
    flask.layers.length === 0 ||
    flask.layers.length === 1 &&
    flask.layers[0].percent === curPercent.value * LAYERS_PER_FLASK.value
  )

const newGame = () => {
  selectedFlaskIndex.value = null
  flasks.value = generateRandomFlasks()
  timer.value.reset()
  timer.value.start()
}

const resetGame = () => {
  showWinMessage.value = false
  newGame()
  store.commit('NULL_WIN_COUNT')
}
</script>

<style lang="scss" scoped>
$btn-color: #36c9ff;
$text-btn-color: #333;
$main-color: gold;

.home {
  text-align: center;
  padding: 20px;
  gap: 15px;
}
.flasks-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.win-message {
  color: $main-color;
  padding: 20px 40px;
  font-size: 32px;
  font-weight: bold;
  z-index: 1000;
}
.reset-btn {
  padding: 10px 20px;
  font-size: 16px;
  background: $btn-color;
  color: $text-btn-color;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.win-counter {
  color: $main-color;
  padding: 8px 16px;
  font-size: 18px;
  font-weight: bold;
}
</style>