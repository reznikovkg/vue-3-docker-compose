<template>
    <div class="dyn-grid-wrapper" ref="gridWrapperRef">
        <div v-if="currentPath.length > 0" class="dyn-grid__breadcrumb">
            <button @click="goUp" class="dyn-grid__back-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <span class="dyn-grid__path">
                <template v-for="(item, idx) in ellipsizedPath" :key="idx">
                    <span v-if="item.type === 'ellipsis'"> / ... / </span>
                    <span v-else>
                        {{ item.name }}
                        <span v-if="idx < ellipsizedPath.length - 1 && ellipsizedPath[idx + 1]?.type !== 'ellipsis'"> / </span>
                    </span>
                </template>
            </span>
        </div>
        <div 
            class="dyn-grid" 
            :style="{
                '--cols': cols,
                '--rows': rows
            }"
            @dragover.prevent>
            <div 
                v-for="(item, index) in currentItems" 
                :key="item.id || index" 
                class="dyn-grid__cell" 
                :class="{
                    'dyn-grid__cell--dragging': index === draggingIndex,
                    'dyn-grid__cell--over-center': overIndex === index && isOverCenter && draggingIndex !== null,
                    'dyn-grid__cell--over-edge': overIndex === index && !isOverCenter && draggingIndex !== null,
                    'dyn-grid__cell--folder': isFolder(item)
                }"
                draggable="true"
                @dragstart="(e) => onDragStart(e, item, index)"
                @dragenter.prevent="(e) => onDragEnter(e, item, index)"
                @dragover.prevent="(e) => onDragOver(e, item, index)"
                @dragend="() => onDragEnd()"
                @drop.prevent="(e) => onDrop(e, item, index)"
                @click="(e) => onCellClick(e, item)"
                @mouseenter="(e) => onCellMouseEnter(e, item, index)"
                @mouseleave="() => onCellMouseLeave()">
                <div class="dyn-grid__cell-content">
                    <slot 
                        name="cell" 
                        :item="item" 
                        :index="index"
                        :isFolder="isFolder(item)">
                        {{ isFolder(item) ? '📁' : item.name || item }}
                    </slot>
                </div>
                <button 
                    v-if="showDelete"
                    class="dyn-grid__delete-btn"
                    @click.stop="(e) => onDelete(e, item, index)">
                    ×
                </button>
                <div 
                    v-if="hoveredItemIndex === index && isFolder(item)" 
                    class="dyn-grid__folder-name">
                    {{ item.name || 'Папка' }}
                </div>
            </div>
        </div>
    </div>
</template>
 
<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

/**
 * Порог для определения центра элемента при перетаскивании (40% от размера)
 */
const DRAG_CENTER_THRESHOLD = 0.4

/**
 * Задержка перед входом в папку после drop (мс)
 */
const FOLDER_ENTER_DELAY = 100

/**
 * Максимальное количество элементов в пути для отображения без ellipsis
 */
const MAX_PATH_ITEMS_WITHOUT_ELLIPSIS = 3

const props = defineProps({
    modelValue: { type: Array, required: true },
    rows: { type: Number, default: 3 },
    cols: { type: Number, default: 4 },
    showDelete: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'delete', 'enter-folder'])

const items = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

// Состояние навигации
const currentPath = ref([])

// Состояние перетаскивания
const draggingIndex = ref(null)
const overIndex = ref(null)
const isOverCenter = ref(false)
const targetFolderId = ref(null)
const gridWrapperRef = ref(null)

// Айтем, над которым находится курсор
const hoveredItemIndex = ref(null)

/**
 * Вычисляет текущие элементы с учетом пути навигации
 * @returns {Array} Текущий список элементов на активном уровне
 */
const currentItems = computed(() => {
    let result = items.value
    for (const pathIndex of currentPath.value) {
        const folder = result[pathIndex]
        if (folder && isFolder(folder)) {
            result = folder.children || []
        } else {
            return []
        }
    }
    return result
})

/**
 * Обновляет элементы текущего уровня с учетом вложенности
 * @param {Array} newItems - Новый массив элементов
 */
const updateCurrentItems = (newItems) => {
    if (currentPath.value.length === 0) {
        items.value = newItems
        return
    }
    
    const updated = [...items.value]
    let current = updated
    
    // Находим нужную папку в структуре
    for (let i = 0; i < currentPath.value.length - 1; i++) {
        const idx = currentPath.value[i]
        if (current[idx]) {
            current[idx] = { ...current[idx] }
            current[idx].children = current[idx].children ? [...current[idx].children] : []
            current = current[idx].children
        } else {
            return
        }
    }
    
    // Обновляем children последней папки в пути
    const lastIdx = currentPath.value[currentPath.value.length - 1]
    if (current[lastIdx]) {
        current[lastIdx] = { ...current[lastIdx], children: newItems }
        items.value = updated
    }
}

/**
 * Проверяет, является ли элемент папкой
 * @param {Object} item - Элемент для проверки
 * @returns {boolean} true если элемент является папкой
 */
const isFolder = (item) => {
    return item && (item.type === 'folder' || Array.isArray(item.children))
}

/**
 * Генерирует уникальный ID для элемента
 * @returns {string} Уникальный идентификатор
 */
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Генерирует уникальное имя для новой папки
 * @returns {string} Уникальное имя папки
 */
const generateUniqueFolderName = () => {
    const baseName = 'Новая папка'
    const existingNames = currentItems.value
        .filter(item => isFolder(item))
        .map(item => item.name)
    
    if (!existingNames.includes(baseName)) {
        return baseName
    }
    
    let counter = 1
    let newName = `${baseName} (${counter})`
    while (existingNames.includes(newName)) {
        counter++
        newName = `${baseName} (${counter})`
    }
    
    return newName
}

/**
 * Обработчик начала перетаскивания элемента
 * @param {DragEvent} e - Событие перетаскивания
 * @param {Object} item - Перетаскиваемый элемент
 * @param {number} index - Индекс элемента
 */
const onDragStart = (e, _, index) => {
    draggingIndex.value = index
    overIndex.value = index
    isOverCenter.value = false
    targetFolderId.value = null
    
    const dt = e.dataTransfer
        dt.effectAllowed = 'move'
        dt.setData('text/plain', '')
}

/**
 * Обработчик входа курсора в область элемента при перетаскивании
 * @param {DragEvent} e - Событие перетаскивания
 * @param {Object} item - Элемент, над которым находится курсор
 * @param {number} index - Индекс элемента
 */
const onDragEnter = (e, item, index) => {
    if (draggingIndex.value == null || index === draggingIndex.value) {
        return
    }
    
    updateDragOverState(e, item, index)
    overIndex.value = index
}

/**
 * Обработчик движения курсора над элементом при перетаскивании
 * @param {DragEvent} e - Событие перетаскивания
 * @param {Object} item - Элемент, над которым находится курсор
 * @param {number} index - Индекс элемента
 */
const onDragOver = (e, item, index) => {
    if (draggingIndex.value == null) return
    updateDragOverState(e, item, index)
}

/**
 * Обновляет состояние перетаскивания (определяет центр или край элемента)
 * @param {DragEvent} e - Событие перетаскивания
 * @param {Object} targetItem - Целевой элемент
 * @param {number} index - Индекс целевого элемента
 */
const updateDragOverState = (e, targetItem, index) => {
    const cell = e.target.closest('.dyn-grid__cell')
    if (!cell) return
    
    const draggedItem = currentItems.value[draggingIndex.value]
    
    // Папки не могут быть помещены в другие элементы
    if (isFolder(draggedItem)) {
        isOverCenter.value = false
        targetFolderId.value = null
        return
    }
    
    const rect = cell.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX
    const mouseY = e.clientY
    
    const distX = Math.abs(mouseX - centerX) / rect.width
    const distY = Math.abs(mouseY - centerY) / rect.height
    
    const isCenter = distX < DRAG_CENTER_THRESHOLD && distY < DRAG_CENTER_THRESHOLD
    isOverCenter.value = isCenter && targetItem.id !== draggedItem?.id
    
    if (isOverCenter.value) {
        targetFolderId.value = targetItem.id
    } else {
        targetFolderId.value = null
    }
}

/**
 * Обработчик отпускания элемента при перетаскивании
 * @param {DragEvent} e - Событие перетаскивания
 * @param {Object} targetItem - Целевой элемент
 * @param {number} targetIndex - Индекс целевого элемента
 */
const onDrop = (e, targetItem, targetIndex) => {
    if (draggingIndex.value == null) {
        return
    }
    
    e.stopPropagation()
    
    const cell = e.target.closest('.dyn-grid__cell')
    if (!cell) {
        onDragEnd()
        return
    }
    
    const rect = cell.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX
    const mouseY = e.clientY
    
    const threshold = 0.4
    const distX = Math.abs(mouseX - centerX) / rect.width
    const distY = Math.abs(mouseY - centerY) / rect.height
    const isCenter = distX < threshold && distY < threshold
    
    const updated = [...currentItems.value]
    const draggedItem = updated[draggingIndex.value]
    
    if (isCenter && targetItem.id !== draggedItem.id && !isFolder(draggedItem)) {
        const draggedItemCopy = { ...draggedItem }
        updated.splice(draggingIndex.value, 1)
        
        if (isFolder(targetItem)) {
            const targetItemIndex = updated.findIndex(item => item.id === targetItem.id)
            if (targetItemIndex !== -1) {
                if (!updated[targetItemIndex].children) {
                    updated[targetItemIndex].children = []
                }
                updated[targetItemIndex].children.push(draggedItemCopy)
            }
            updateCurrentItems(updated)
            
            emit('enter-folder', targetItem)
            setTimeout(() => {
                currentPath.value = [...currentPath.value, targetItemIndex]
            }, FOLDER_ENTER_DELAY)
        } else {
            const targetItemIndex = updated.findIndex(item => item.id === targetItem.id)
            if (targetItemIndex !== -1) {
                const newFolder = {
                    id: generateId(),
                    name: generateUniqueFolderName(),
                    type: 'folder',
                    children: [targetItem, draggedItemCopy]
                }
                updated[targetItemIndex] = newFolder
                updateCurrentItems(updated)
                
                emit('enter-folder', newFolder)
                setTimeout(() => {
                    // Находим индекс новой папки после обновления
                    const folderIndex = currentItems.value.findIndex(item => item.id === newFolder.id)
                    if (folderIndex !== -1) {
                        currentPath.value = [...currentPath.value, folderIndex]
                    }
                }, FOLDER_ENTER_DELAY)
            }
        }
    } else {
        if (targetIndex === draggingIndex.value) {
            onDragEnd()
            return
        }
        
        const [moved] = updated.splice(draggingIndex.value, 1)
        updated.splice(targetIndex, 0, moved)
        updateCurrentItems(updated)
    }
    
    onDragEnd()
}

/**
 * Обработчик отпускания элемента за пределами сетки
 * Вытаскивает элемент из текущей папки на уровень выше
 * @param {DragEvent} e - Событие перетаскивания
 */
const onDropOutside = (e) => {
    if (draggingIndex.value == null) {
        return
    }
    
    if (!gridWrapperRef.value || !gridWrapperRef.value.contains(e.target)) {
        if (currentPath.value.length > 0) {
            const updated = [...currentItems.value]
            const draggedItem = updated[draggingIndex.value]
            updated.splice(draggingIndex.value, 1)
            updateCurrentItems(updated)
            
            goUp()
            setTimeout(() => {
                const parentItems = [...currentItems.value]
                parentItems.push(draggedItem)
                updateCurrentItems(parentItems)
            }, FOLDER_ENTER_DELAY)
        }
        onDragEnd()
    }
}

/**
 * Обработчик drop на уровне документа (для вытаскивания из папки)
 * @param {DragEvent} e - Событие перетаскивания
 */
const handleDocumentDrop = (e) => {
    if (draggingIndex.value == null) {
        return
    }
    
    if (!gridWrapperRef.value?.contains(e.target)) {
        if (currentPath.value.length > 0) {
            const updated = [...currentItems.value]
            const draggedItem = updated[draggingIndex.value]
            updated.splice(draggingIndex.value, 1)
            updateCurrentItems(updated)
            
            goUp()
            setTimeout(() => {
                const parentItems = [...currentItems.value]
                parentItems.push(draggedItem)
                updateCurrentItems(parentItems)
            }, FOLDER_ENTER_DELAY)
        }
        onDragEnd()
    }
}

/**
 * Обработчик dragover на уровне документа
 * @param {DragEvent} e - Событие перетаскивания
 */
const handleDocumentDragOver = (e) => {
    if (draggingIndex.value !== null) {
        e.preventDefault()
    }
}

onMounted(() => {
    document.addEventListener('drop', handleDocumentDrop)
    document.addEventListener('dragover', handleDocumentDragOver)
})

onUnmounted(() => {
    document.removeEventListener('drop', handleDocumentDrop)
    document.removeEventListener('dragover', handleDocumentDragOver)
})

/**
 * Обработчик окончания перетаскивания
 * Сбрасывает состояние перетаскивания
 */
const onDragEnd = () => {
    draggingIndex.value = null
    overIndex.value = null
    isOverCenter.value = false
    targetFolderId.value = null
}

/**
 * Обработчик клика по ячейке (двойной клик для входа в папку)
 * @param {MouseEvent} e - Событие клика
 * @param {Object} item - Элемент, по которому кликнули
 */
const onCellClick = (e, item) => {
    if (e.detail === 2 && isFolder(item)) {
        const index = currentItems.value.findIndex(i => i.id === item.id)
        if (index !== -1) {
            currentPath.value = [...currentPath.value, index]
            emit('enter-folder', item)
        }
    }
}

/**
 * Переход на уровень выше в навигации
 */
const goUp = () => {
    if (currentPath.value.length > 0) {
        currentPath.value = currentPath.value.slice(0, -1)
    }
}

/**
 * Обработчик удаления элемента
 * @param {MouseEvent} e - Событие клика
 * @param {Object} item - Элемент для удаления
 * @param {number} index - Индекс элемента
 */
const onDelete = (e, item, index) => {
    e.stopPropagation()
    emit('delete', item, index, currentPath.value)
}

/**
 * Обработчик наведения курсора на ячейку (для показа имени папки)
 * @param {MouseEvent} e - Событие мыши
 * @param {Object} item - Элемент, на который навели курсор
 * @param {number} index - Индекс элемента
 */
const onCellMouseEnter = (e, item, index) => {
    if (isFolder(item)) {
        hoveredItemIndex.value = index
    }
}

/**
 * Обработчик ухода курсора с ячейки
 */
const onCellMouseLeave = () => {
    hoveredItemIndex.value = null
}

/**
 * Получает имя папки по индексу в пути навигации
 * @param {number} pathIndex - Индекс папки в текущем уровне
 * @param {number} depth - Глубина вложенности
 * @returns {string} Имя папки или 'Папка' по умолчанию
 */
const getPathItemName = (pathIndex, depth) => {
    let current = items.value
    for (let i = 0; i <= depth; i++) {
        if (i === depth) {
            const folder = current[pathIndex]
            return folder?.name || 'Папка'
        }
        const folder = current[currentPath.value[i]]
        if (folder && isFolder(folder)) {
            current = folder.children || []
        } else {
            return 'Папка'
        }
    }
    return 'Папка'
}

/**
 * Вычисляет путь хлебных крошек с ellipsis для длинных путей
 * @returns {Array} Массив элементов пути с ellipsis при необходимости
 */
const ellipsizedPath = computed(() => {
    const path = currentPath.value
    if (path.length <= MAX_PATH_ITEMS_WITHOUT_ELLIPSIS) {
        return path.map((pathIndex, idx) => ({
            type: 'item',
            name: getPathItemName(pathIndex, idx)
        }))
    }
    
    const first = {
        type: 'item',
        name: getPathItemName(path[0], 0)
    }
    
    const ellipsis = {
        type: 'ellipsis'
    }
    
    const last = {
        type: 'item',
        name: getPathItemName(path[path.length - 1], path.length - 1)
    }
    
    return [first, ellipsis, last]
})

/**
 * Создает новую папку в текущем уровне
 * @returns {Object} Созданная папка
 */
const createFolder = () => {
    const newFolder = {
        id: generateId(),
        name: generateUniqueFolderName(),
        type: 'folder',
        children: []
    }
    const updated = [...currentItems.value, newFolder]
    updateCurrentItems(updated)
    return newFolder
}

defineExpose({
    goUp,
    currentPath: computed(() => currentPath.value),
    getCurrentItems: () => currentItems.value,
    updateCurrentItems,
    createFolder
})
</script>
 
<style scoped lang="less">
.dyn-grid-wrapper {
    position: relative;
}

.dyn-grid__breadcrumb {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    margin-bottom: 12px;
    background: transparent;
    border-radius: 4px;
}

.dyn-grid__back-btn {
    padding: 4px 8px;
    background: transparent;
    color: #28a745;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    line-height: 1;
    min-width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        width: 16px;
        height: 16px;
    }
    
    &:hover {
        background: rgba(40, 167, 69, 0.1);
    }
}

.dyn-grid__path {
    font-size: 14px;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
}

.dyn-grid {
    display: grid;
    flex-wrap: wrap;
    grid-template-columns: repeat(var(--cols), 70px);
    grid-template-rows: repeat(var(--rows), 70px);
    gap: 12pt;
    position: relative;
    min-height: 200px;
    border: 2px dashed transparent;
    padding: 8px;
    
    &:has(.dyn-grid__cell--dragging) {
        border-color: #007bff;
    }

    &__cell {
        position: relative;
        transition: transform .30s ease, box-shadow .30s ease, outline-color .30s ease;
        will-change: transform;
        
        &-content {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    &__cell:hover {
        transform: translateY(-2px);
    }

    &__cell--dragging {
        opacity: .5;
        transform: scale(.95);
        box-shadow: 0 8px 18px rgba(0, 0, 0, .25);
        z-index: 10;
    }

    &__cell--over-center:not(&--dragging) {
        outline: 3px solid #28a745;
        outline-offset: 2px;
        background: rgba(40, 167, 69, 0.1);
    }
    
    &__delete-btn {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #dc3545;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 5;
        opacity: 0;
        transition: opacity 0.2s;
        
        &:hover {
            background: #c82333;
        }
    }
    
    &__cell:hover &__delete-btn {
        opacity: 1;
    }
    
    &__folder-name {
        position: absolute;
        bottom: -18px;
        left: 50%;
        transform: translateX(-50%) translateY(0);
        color: white;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s ease, transform 0.2s ease;
        pointer-events: none;
        z-index: 5;
    }
    
    &__cell:hover &__folder-name {
        opacity: 1;
        transform: translateX(-50%) translateY(2px);
    }
}
</style>
