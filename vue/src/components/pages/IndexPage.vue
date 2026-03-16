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
    <RouterLink :to="{ name: $routes.SETTING }">
      Настройки
    </RouterLink>
    <div v-if="showWinMessage" class="win-message">
      Победа
    </div>
  </div>
</template>

<script setup>
import Flask from '@/components/Flask.vue'
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const FLASK_COUNT = computed(() => store.getters.getFlaskCount)
const LAYERS_PER_FLASK = computed(() => store.getters.getLayersPerFlask)
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
const selectedFlaskIndex = ref(null)
const flasks = ref([])
const showWinMessage = ref(false)
const winCount = computed(() => store.getters.getWinCount)

onMounted(() => {
  newGame()
})

const handleFlaskClick = (index) => {
  console.log('Клик по колбе с индексом:', index)
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

const getAvailableSpace = (flask) => {
  if (flask.layers.length === 0) return 100;
  const usedSpace = flask.layers.reduce((sum, layer) => sum + layer.percent, 0)
  return 100 - usedSpace
}

const pour = (fromIndex, toIndex) => {
  console.log('Переливаем из', fromIndex, 'в', toIndex)

  const fromFlask = flasks.value[fromIndex]
  const toFlask = flasks.value[toIndex]

  if (fromFlask.layers.length === 0) return

  const topLayer = fromFlask.layers[fromFlask.layers.length - 1]

  const availableSpace = getAvailableSpace(toFlask)
  if (availableSpace === 0) {
    console.log('Целевая колба переполнена, нельзя перелить')
    return
  }
      
  if (availableSpace < 100) {
    const toTopLayer = toFlask.layers[toFlask.layers.length - 1]
    if (toTopLayer.color !== topLayer.color) {
      console.log('Цвета не совпадают, нельзя перелить')
      return
    }
  }

  const pourAmount = Math.min(topLayer.percent, availableSpace)
  console.log('Переливаем ', pourAmount, ' цвета ', topLayer.color)

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
    showWinMessage.value = true
    console.log('Победа')
    setTimeout(() => {
      showWinMessage.value = false
      newGame()
    }, 2000)
    store.commit('INC_WIN_COUNT')
  }
}

const generateRandomFlasks = () => {
  const newFlasks = []
  let percent = 100 / LAYERS_PER_FLASK.value

  let fullFlasks = 0
  if (FLASK_COUNT.value <= 5) {
    fullFlasks = FLASK_COUNT.value - 1
  } else if (FLASK_COUNT.value <= 11) {
    fullFlasks = FLASK_COUNT.value - 2
  } else {
    fullFlasks = FLASK_COUNT.value - 3
  }

  const mapColors = []
  for (let i = 0; i < fullFlasks; i++) {
    mapColors.push(COLORS[Math.floor(Math.random() * COLORS.length)])
  }
  console.log(mapColors)
  const mapCounts = []
  for (let i = 0; i < fullFlasks; i++) {
    mapCounts.push(LAYERS_PER_FLASK.value)
  }
  console.log(mapCounts)

  for (let i = 0; i < fullFlasks - 1; i++) {
    const layers = []
    let fullness = 0
    console.log('Генерация слоев для колбы ', i)
    do {
      let colorIndex = Math.floor(Math.random() * mapColors.length)
      console.log('Выбираем цвет: ', colorIndex)
      let rndParts = 1
      if (mapCounts[colorIndex] != 1) {
        rndParts = Math.min(Math.floor(Math.random() * (mapCounts[colorIndex] - 1) + 1), LAYERS_PER_FLASK.value - fullness)
      }
      console.log('Берем ', rndParts, ' частей этого цвета')
      console.log('Получаем ', percent * rndParts, ' процент цвета в колбе')
      if (layers.length > 0 && layers[layers.length - 1].color === mapColors[colorIndex]) {
        layers[layers.length - 1].percent += percent * rndParts
      } else {
        layers.push({
          color: mapColors[colorIndex],
          percent: percent * rndParts
        })
      }
      fullness += rndParts
      mapCounts[colorIndex] -= rndParts
      console.log('Остается ', mapCounts[colorIndex], ' этого цвета')
      if (mapCounts[colorIndex] === 0) {
        mapColors.splice(colorIndex, 1)
        mapCounts.splice(colorIndex, 1)
      }
    } while (fullness < LAYERS_PER_FLASK.value)
    newFlasks.push( {layers} )
  }
  console.log('Генерация последней колбы')
  const lastLayers = []
  console.log('Помещаем, что осталось: ', mapColors, mapCounts)
  for (let i = 0; i < mapColors.length; i++) {
    lastLayers.push({
      color: mapColors[i],
      percent: percent * mapCounts[i]
    })
  }
  for (let i = 1; i < lastLayers.length; i++) {
    if (lastLayers[i].color === lastLayers[i - 1].color) {
      console.log('Несколько слоев одного цвета подряд')
      lastLayers[i - 1].percent += lastLayers[i].percent
      lastLayers.splice(i, 1)
    }
  }
  console.log(lastLayers)
  newFlasks.push( {layers: lastLayers} )

  for (let i = 0; i < FLASK_COUNT.value - fullFlasks; i++) {
    newFlasks.push( {layers: []} )
  }

  return newFlasks
}

const checkWin = () => {
  for (let flask of flasks.value) {
    if (flask.layers.length === 0) continue
    if (flask.layers.length > 1) return false
    if (flask.layers[0].percent !== 100) return false
  }
  return true
}

const newGame = () => {
  selectedFlaskIndex.value = null
  flasks.value = generateRandomFlasks()
  console.log('Новая игра', flasks)
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