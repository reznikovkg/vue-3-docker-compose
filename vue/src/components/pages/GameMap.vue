<template>
    <div class="game-map">
        <h3>🗺️ Карта мира</h3>
        <div class="coords">
            📍 Координаты лодки: [{{ boatX }}, {{ boatY }}]
        </div>

        <div class="grid">
            <div v-for="row in rows" :key="row" class="grid-row">
                <div v-for="col in cols" :key="col" class="grid-cell" :class="getCellClass(row, col)"
                    @click="moveToCell(row, col)">
                    <span v-if="boatX === col && boatY === row">
                        ⛵
                    </span>
                    <span v-else-if="getZoneAt(col, row)">
                        {{ getZoneAt(col, row) }}
                    </span>
                    <span v-else class="water">
                        💧
                    </span>
                </div>
            </div>
        </div>

        <div class="controls">
            <button @click="$emit('move', 0, -1)">⬆️ Вверх</button>
            <button @click="$emit('move', -1, 0)">⬅️ Влево</button>
            <button @click="$emit('move', 1, 0)">➡️ Вправо</button>
            <button @click="$emit('move', 0, 1)">⬇️ Вниз</button>
        </div>

        <div class="legend">
            <div><span class="legend-color low"></span> Мелководье</div>
            <div><span class="legend-color medium"></span> Глубокое место</div>
            <div><span class="legend-color high"></span> Рыбное место!</div>
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
    boatX: Number,     // Получаем данные от родительского компонента
    boatY: Number,
    zones: Array
})

const emit = defineEmits(['move'])  // событие, которое мы отправляем родительскому компоненту

const rows = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
const cols = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]


function getZoneAt(x, y) {
    for (const zone of props.zones) {
        const dx = x - zone.x
        const dy = y - zone.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance <= zone.radius) {
            return zone.type === 'low' ? '🌊' : (zone.type === 'medium' ? '🐟' : '⚡')
        }
    }
    return null
}

function getCellClass(row, col) {
    const zone = getZoneAt(col, row)
    if (zone === '🌊') return 'cell-low'
    if (zone === '🐟') return 'cell-medium'
    if (zone === '⚡') return 'cell-high'
    return ''
}

function moveToCell(row, col) {
    const targetX = col
    const targetY = row
    const dx = targetX - props.boatX
    const dy = targetY - props.boatY
    emit('move', dx, dy)
}
</script>

<style scoped>
.game-map {
    background: rgb(9, 146, 236);
    border-radius: 16px;
    padding: 16px;
    flex: 2;
    min-width: 500px;
}

.coords {
    background: #0c08fb;
    padding: 8px;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 16px;
    color: #ffefb9;
}

.grid {
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: #020c47;
    padding: 10px;
    border-radius: 12px;
}

.grid-row {
    display: flex;
    gap: 2px;
    justify-content: center;
}

.grid-cell {
    width: 40px;
    height: 40px;
    background: #3f7e5c;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    cursor: pointer;
    font-size: 20px;
    transition: 0.1s;
}

.grid-cell:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
}

.cell-low {
    background: #4d9eff;
}

.cell-medium {
    background: #e67e22;
}

.cell-high {
    background: #f1c40f;
}

.water {
    opacity: 0.7;
}

.controls {
    margin-top: 16px;
    display: flex;
    gap: 10px;
    justify-content: center;
}

.legend {
    margin-top: 16px;
    display: flex;
    gap: 16px;
    justify-content: center;
    font-size: 12px;
    color: #ddd;
}

.legend-color {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    margin-right: 5px;
    vertical-align: middle;
}

.legend-color.low {
    background: #4d9eff;
}

.legend-color.medium {
    background: #e67e22;
}

.legend-color.high {
    background: #f1c40f;
}
</style>