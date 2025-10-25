<template >
  <div class="game-container">
    <h2 class="title">✨ Match-3 Engine (Prototype)</h2>

    <div class="controls" >
      <label>Grid Size:</label>
      <input v-model.number="gridSize" type="number" min="4" max="14" @change="onGridSizeChange" />
      <button @click="initializeGame">Restart</button>
    </div>

    <div class="outer-board">
      <div class="game-board" :style="boardStyle" ref="boardRef">
        <div
          v-for="cell in grid.flat()"
          :key="cell.id"
          class="game-cell"
          :class="{
            selected: selectedCell && selectedCell.id === cell.id,
            matched: matchedSet.has(cell.id),
            invalid: animatingRevert && (revertIds && revertIds.includes(cell.id))
          }"
          draggable="true"
          @dragstart="onDragStart(cell, $event)"
          @dragover.prevent
          @drop="onDrop($event, cell)"
          @click="onCellClick(cell)"
        >
          <div
            v-if="cell.color"
            class="gem"
            :style="{ backgroundColor: cell.color }"
            :data-id="cell.id"
          ></div>
        </div>
      </div>
    </div>

    <div class="game-info">
      <p>Selected: {{ selectedCell ? `(${selectedCell.x}, ${selectedCell.y})` : 'None' }}</p>
      <p>Grid: {{ gridSize }} × {{ gridSize }}</p>
    </div>
 </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

/* ===========================
   Configuración y estado
   =========================== */
const MIN_GRID = 4
const DEFAULT_GRID = 8
const COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#ffffff'
] 

// Board layout constants (visual)
const BOARD_PIXELS = 500         // cuadro visible fijo donde "encaja" el tablero
const BOARD_PADDING = 10        // padding interior del marco
const GAP_PX = 6                // gap entre celdas

const gridSize = ref(DEFAULT_GRID)
const grid = ref([])            // matriz 2D: grid[y][x] = { id, x, y, color }
const selectedCell = ref(null)  // celda seleccionada por click o dragstart
const matchedSet = ref(new Set()) // ids marcados como matched para animación
const animatingRevert = ref(false) // bloquea acciones durante revert
const revertIds = ref(null)     // ids implicados en revert (para marcar) 
const boardRef = ref(null)

/* ===========================
   Utilidades
   =========================== */
const makeCell = (id, x, y) => ({ id, x, y, color: randomColor() })
function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}
function findCellById(id) {
  for (let y = 0; y < gridSize.value; y++) {
    for (let x = 0; x < gridSize.value; x++) {
      if (grid.value[y][x].id === id) return grid.value[y][x]
    }
  }
  return null
}
function isAdjacent(c1, c2) {
  if (!c1 || !c2) return false
  const dx = Math.abs(c1.x - c2.x)
  const dy = Math.abs(c1.y - c2.y)
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1)
}

/* ===========================
   Cálculo del tamaño de celda para que TODO "encaje"
   =========================== */
const cellSizePx = computed(() => {
  // Espacio disponible interior = BOARD_PIXELS - 2*padding - (gap*(n-1))
  const inner = BOARD_PIXELS - 2 * BOARD_PADDING - (GAP_PX * (gridSize.value - 1))
  // Tamaño entero por celda
  return Math.floor(inner / gridSize.value)
})
const boardStyle = computed(() => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize.value}, ${cellSizePx.value}px)`,
    gridTemplateRows: `repeat(${gridSize.value}, ${cellSizePx.value}px)`,
    gap: `${GAP_PX}px`,
    width: `${BOARD_PIXELS}px`,
    height: `${BOARD_PIXELS}px`,
    padding: `${BOARD_PADDING}px`,
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #1e3c72, #2a5298)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
    border: '4px solid rgba(255,255,255,0.15)',
    boxSizing: 'border-box',
    alignContent: 'center',
    justifyContent: 'center'
  }
})

/* ===========================
   Inicialización del tablero
   - Genera un gridSize x gridSize de colores aleatorios
   - Asegura que no haya matches iniciales (regenerando celdas concretas)
   =========================== */
const initializeGame = () => {
  // crear grid básica
  let idCounter = 0
  const newGrid = []
  for (let y = 0; y < gridSize.value; y++) {
    const row = []
    for (let x = 0; x < gridSize.value; x++) {
      row.push({ id: idCounter++, x, y, color: randomColor() })
    }
    newGrid.push(row)
  }
  grid.value = newGrid
  selectedCell.value = null
  matchedSet.value = new Set()

  // eliminar coincidencias iniciales (bucle seguro)
  removeInitialMatches()
}

function removeInitialMatches() {
  let matches = findMatches()
  // mientras haya coincidencias: regenera las celdas implicadas
  while (matches.length > 0) {
    // para cada celda en matches, le ponemos un color nuevo aleatorio distinto
    for (const m of matches) {
      grid.value[m.y][m.x].color = randomColor()
    }
    matches = findMatches()
    // pequeña pausa opcional para evitar bloqueo extremo
    new Promise((r) => setTimeout(r, 0))
  }
}

/* ===========================
   Find Matches (horizontal y vertical)
   devuelve array de celdas (objetos) que están en matches (no duplicadas)
   =========================== */
function findMatches() {
  const ids = new Set()

  // horizontal
  for (let y = 0; y < gridSize.value; y++) {
    let runColor = null
    let runStart = 0
    let runLen = 0
    for (let x = 0; x < gridSize.value; x++) {
      const c = grid.value[y][x]
      if (!c.color) { // vacío rompe run
        if (runLen >= 3) {
          for (let k = 0; k < runLen; k++) ids.add(grid.value[y][runStart + k].id)
        }
        runColor = null; runLen = 0; runStart = x + 1
        continue
      }
      if (c.color === runColor) {
        runLen++
      } else {
        if (runLen >= 3) {
          for (let k = 0; k < runLen; k++) ids.add(grid.value[y][runStart + k].id)
        }
        runColor = c.color
        runLen = 1
        runStart = x
      }
    }
    if (runLen >= 3) {
      for (let k = 0; k < runLen; k++) ids.add(grid.value[y][runStart + k].id)
    }
  }

  // vertical
  for (let x = 0; x < gridSize.value; x++) {
    let runColor = null
    let runStart = 0
    let runLen = 0
    for (let y = 0; y < gridSize.value; y++) {
      const c = grid.value[y][x]
      if (!c.color) {
        if (runLen >= 3) {
          for (let k = 0; k < runLen; k++) ids.add(grid.value[runStart + k][x].id)
        }
        runColor = null; runLen = 0; runStart = y + 1
        continue
      }
      if (c.color === runColor) {
        runLen++
      } else {
        if (runLen >= 3) {
          for (let k = 0; k < runLen; k++) ids.add(grid.value[runStart + k][x].id)
        }
        runColor = c.color
        runLen = 1
        runStart = y
      }
    }
    if (runLen >= 3) {
      for (let k = 0; k < runLen; k++) ids.add(grid.value[runStart + k][x].id)
    }
  }

  // convertir ids a objetos de celda
  return Array.from(ids).map((id) => findCellById(id)).filter(Boolean)
}

/* ===========================
   Procesar matches (eliminar -> gravedad -> rellenar -> chain reaction)
   =========================== */
function processMatchesAndCollapse() {
  let matches = findMatches()
  if (matches.length === 0) return false

  // marcar matched para animación
  matchedSet.value = new Set(matches.map(m => m.id))
  // espera pequeña para animación
  new Promise((r) => setTimeout(r, 300))

  // eliminar (poner color = null)
  for (const m of matches) {
    grid.value[m.y][m.x].color = null
  }

  matchedSet.value = new Set()

  // aplicar gravedad
  applyGravity()

  // rellenar vacíos desde arriba
  refillFromTop()

  // posibles nuevas coincidencias (chain reaction)
  new Promise((r) => setTimeout(r, 120))
  return true
}

function applyGravity() {
  // repetimos hasta que no se mueva nada
  let moved
  do {
    moved = false
    for (let y = gridSize.value - 1; y > 0; y--) {
      for (let x = 0; x < gridSize.value; x++) {
        if (!grid.value[y][x].color && grid.value[y - 1][x].color) {
          grid.value[y][x].color = grid.value[y - 1][x].color
          grid.value[y - 1][x].color = null
          moved = true
        }
      }
    }
    if (moved) {
      new Promise((r) => setTimeout(r, 80))
    }
  } while (moved)
}

function refillFromTop() {
  for (let x = 0; x < gridSize.value; x++) {
    for (let y = 0; y < gridSize.value; y++) {
      if (!grid.value[y][x].color) {
        grid.value[y][x].color = randomColor()
      }
    }
  }
}

/* ===========================
   Intercambio seguro
   - intercambiar sólo celdas adyacentes
   - si no genera match, revertir
   - si produce match(s), procesar (incluye chain reactions)
   =========================== */
function attemptSwap(c1, c2) {
  if (!c1 || !c2) return
  if (!isAdjacent(c1, c2)) return

  // intercambio en el modelo
  const a = grid.value[c1.y][c1.x].color
  const b = grid.value[c2.y][c2.x].color
  grid.value[c1.y][c1.x].color = b
  grid.value[c2.y][c2.x].color = a

  // espera visual corta
  nextTick()
  new Promise((r) => setTimeout(r, 180))

  // comprobar matches
  let matches = findMatches()
  if (matches.length === 0) {
    // revertir: animación sutil y retornar
    animatingRevert.value = true
    revertIds.value = [c1.id, c2.id]
    // ligero delay visual
    new Promise((r) => setTimeout(r, 220))
    // revertir colores
    grid.value[c1.y][c1.x].color = a
    grid.value[c2.y][c2.x].color = b
    new Promise((r) => setTimeout(r, 80))
    animatingRevert.value = false
    revertIds.value = null
    return false
  } else {
    // hubo match: procesar todas las reacciones (bucle)
    let any = true
    while (any) {
      any = processMatchesAndCollapse()
    }
    return true
  }
}

/* ===========================
   Handlers de UI: click, drag/drop, keyboard
   =========================== */
function onCellClick(cell) {
  if (animatingRevert.value) return
  if (!selectedCell.value) {
    selectedCell.value = cell
    return
  }
  // si damos click en la misma, deselecciona
  if (selectedCell.value.id === cell.id) {
    selectedCell.value = null
    return
  }
  // si es adyacente -> intento de swap
  if (isAdjacent(selectedCell.value, cell)) {
    // bloquear input mientras se procesa
    const prev = selectedCell.value
    selectedCell.value = null
    attemptSwap(prev, cell)
  } else {
    // selecciona la nueva
    selectedCell.value = cell
  }
}

function onDragStart(cell, event) {
  if (animatingRevert.value) { event.preventDefault(); return }
  event.dataTransfer.setData('text/plain', String(cell.id))
  selectedCell.value = cell
}

function onDrop(event, targetCell) {
  if (animatingRevert.value) return
  const id = parseInt(event.dataTransfer.getData('text/plain'), 10)
  const source = findCellById(id)
  if (!source) return
  // solo adyacentes permitidos
  if (!isAdjacent(source, targetCell)) {
    // no hacemos nada (podrías dar feedback)
    selectedCell.value = null
    return
  }
  // intento de swap
  selectedCell.value = null
  attemptSwap(source, targetCell)
}

/* Keyboard: seleccionar con click y usar flechas */
function onKeyDown(e) {
  if (!selectedCell.value || animatingRevert.value) return
  const s = selectedCell.value
  let target = null
  if (e.key === 'ArrowUp' && s.y > 0) target = grid.value[s.y - 1][s.x]
  if (e.key === 'ArrowDown' && s.y < gridSize.value - 1) target = grid.value[s.y + 1][s.x]
  if (e.key === 'ArrowLeft' && s.x > 0) target = grid.value[s.y][s.x - 1]
  if (e.key === 'ArrowRight' && s.x < gridSize.value - 1) target = grid.value[s.y][s.x + 1]
  if (target) {
    // evita scroll de la página en flechas
    e.preventDefault()
    const source = selectedCell.value
    selectedCell.value = null
    attemptSwap(source, target)
  }
}

/* ===========================
   Cambio de tamaño de grid por el input
   =========================== */
function onGridSizeChange() {
  if (!gridSize.value || gridSize.value < MIN_GRID) gridSize.value = MIN_GRID
  if (gridSize.value > 14) gridSize.value = 14
  initializeGame()
}

/* ===========================
   Lifecycle
   =========================== */
onMounted(() => {
  initializeGame()
  window.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
/* contenedor general */
.game-container {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 18px;
  color: #fff;
  font-family: Inter, system-ui, sans-serif;

  min-height: 100vh;
  min-width: 100vw; /* Исправьте на 100vw (viewport width) */
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  background-size: cover; /* Замените 100% на cover */
}

/* controles */
.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}
.controls input {
  width: 68px;
  padding: 6px;
  border-radius: 8px;
  border: none;
}

/* marco exterior centrado */
.outer-board {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* tablero (grid) se estiliza desde boardStyle computado */
.game-board {
  box-sizing: border-box;
}

/* celda */
.game-cell {
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(255,255,255,0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s;
  user-select: none;
}

/* gema (círculo) */
.gem {
  width: 86%;
  height: 86%;
  border-radius: 50%;
  box-shadow: 0 6px 14px rgba(0,0,0,0.45), inset 0 -6px 12px rgba(255,255,255,0.05);
  transition: transform 0.15s ease, box-shadow 0.15s;
}
.gem:hover {
  transform: scale(1.06);
}

/* estado seleccionado */
.game-cell.selected {
  outline: 3px solid rgba(255,255,255,0.22);
  transform: translateY(-2px);
}

/* matched (animación de "estallar") */
.game-cell.matched .gem {
  animation: pop 320ms ease-in-out;
}
@keyframes pop {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.85; }
  100% { transform: scale(0.1); opacity: 0; }
}

/* revert: marcar temporalmente las dos celdas que se devuelven */
.game-cell.invalid {
  box-shadow: 0 0 0 3px rgba(255,80,80,0.22);
  transform: translateY(-2px);
}

/* info */
.game-info {
  font-size: 0.9rem;
  opacity: 0.95;
  text-align: center;
}
</style>




