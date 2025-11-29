<template>
    <RouterLink :to="{ name: $routes.INDEX }">To Index</RouterLink>
    <div>
        Grid page
    </div>
    <DynamicGrid 
        ref="gridRef"
        v-model="items" 
        :rows="rows" 
        :cols="cols"
        @delete="(item: GridItem, index: number, path: number[]) => onDelete(item, index, path)"
        @enter-folder="(folder: GridItem) => onEnterFolder(folder)">
        <template #cell="{ item, isFolder }">
            <div class="sample-cell" :class="{ 'sample-cell--folder': isFolder }">
                {{ isFolder ? '📁' : (item.name || item) }}
            </div>
        </template>
    </DynamicGrid>
    <div>
        <div class="inputs">
            <div>
                Rows:
                <input type="number" v-model="rows" @change="() => trimItems()">
            </div>
            <div>
                Cols:
                <input type="number" v-model="cols" @change="() => trimItems()">
            </div>
        </div>
        <div class="inputs">
            <button @click="() => addItem()">
                Add
            </button>
            <button @click="() => removeItem()">
                Remove
            </button>
            <button @click="() => generateItems()">
                Generate
            </button>
            <button @click="() => createFolder()">
                Create folder
            </button>
        </div>
    </div>
    
    <div v-if="showDeleteModal" class="modal-overlay" @click="() => cancelDelete()">
        <div class="modal-content" @click.stop>
            <h3>Удаление папки</h3>
            <p>Папка не пустая. Вы уверены, что хотите удалить эту папку?</p>
            <div class="modal-actions">
                <button @click="() => confirmDelete()" class="btn-alert">Удалить</button>
                <button @click="() => cancelDelete()">Отмена</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DynamicGrid from '../DynamicGrid.vue';

interface GridItem {
    id: string
    name: string
    type: 'item' | 'folder'
    children?: GridItem[]
}

const rows = ref(5)
const cols = ref(5)
const capacity = computed(() => rows.value * cols.value)

const items = ref<GridItem[]>([
    { id: '1', name: '1', type: 'item' },
    { id: '2', name: '2', type: 'item' },
    { id: '3', name: '3', type: 'item' },
    { id: '4', name: '4', type: 'item' },
    { id: '5', name: '5', type: 'item' },
    { id: '6', name: '6', type: 'item' },
    { id: '7', name: '7', type: 'item' },
    { id: '8', name: '8', type: 'item' },
    { id: '9', name: '9', type: 'item' },
    { id: '10', name: '10', type: 'item' },
])

const gridRef = ref<{ getCurrentItems?: () => GridItem[], updateCurrentItems?: (items: GridItem[]) => void, createFolder?: () => GridItem } | null>(null)
const showDeleteModal = ref(false)
const deleteTarget = ref<GridItem | null>(null)
const deleteIndex = ref<number | null>(null)
const deletePath = ref<number[]>([])

/**
 * Генерирует уникальный ID для элемента
 * @returns {string} Уникальный идентификатор
 */
const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Рекурсивно собирает все имена элементов из структуры
 * @param {GridItem[]} itemsList - Список элементов для обхода
 * @returns {Set<string>} Множество всех имен элементов
 */
const getAllItemNames = (itemsList: GridItem[]): Set<string> => {
    const names = new Set<string>()
    
    const traverse = (items: GridItem[]) => {
        if (!Array.isArray(items)) return
        items.forEach(item => {
            if (item.name) {
                names.add(item.name)
            }
            if (item.children && Array.isArray(item.children)) {
                traverse(item.children)
            }
        })
    }
    
    traverse(itemsList)
    return names
}

/**
 * Генерирует следующее уникальное имя для элемента
 * @returns {string} Уникальное имя элемента
 */
const getNextUniqueItemName = (): string => {
    const allNames = getAllItemNames(items.value)
    let counter = 1
    let name = String(counter)
    
    while (allNames.has(name)) {
        counter++
        name = String(counter)
    }
    
    return name
}

/**
 * Получает текущие элементы с учетом уровня вложенности
 * @returns {GridItem[]} Текущий список элементов
 */
const getCurrentItems = (): GridItem[] => {
    if (gridRef.value?.getCurrentItems) {
        return gridRef.value.getCurrentItems()
    }
    return items.value
}

/**
 * Обновляет текущие элементы с учетом уровня вложенности
 * @param {GridItem[]} newItems - Новый список элементов
 */
const updateCurrentItems = (newItems: GridItem[]): void => {
    if (gridRef.value?.updateCurrentItems) {
        gridRef.value.updateCurrentItems(newItems)
    } else {
        items.value = newItems
    }
}

/**
 * Добавляет новый элемент в текущий уровень
 */
const addItem = (): void => {
    const currentItemsList = getCurrentItems()
    if (currentItemsList.length >= capacity.value) {
        return
    }

    const item: GridItem = {
        id: generateId(),
        name: getNextUniqueItemName(),
        type: 'item'
    }
    const updated = [...currentItemsList, item]
    updateCurrentItems(updated)
}

/**
 * Удаляет последний элемент из текущего уровня
 */
const removeItem = (): void => {
    const currentItemsList = getCurrentItems()
    if (currentItemsList.length > 0) {
        const updated = [...currentItemsList]
        updated.pop()
        updateCurrentItems(updated)
    }
}

/**
 * Генерирует элементы до заполнения capacity текущего уровня
 */
const generateItems = (): void => {
    const currentItemsList = getCurrentItems()
    const targetCount = capacity.value
    const itemsToAdd = targetCount - currentItemsList.length
    
    if (itemsToAdd <= 0) {
        return
    }
    
    const allNames = getAllItemNames(items.value)
    let counter = 1
    const itemsToCreate: GridItem[] = []
    
    for (let i = 0; i < itemsToAdd; i++) {
        let name = String(counter)
        while (allNames.has(name)) {
            counter++
            name = String(counter)
        }
        allNames.add(name)
        counter++
        
        itemsToCreate.push({
            id: generateId(),
            name: name,
            type: 'item'
        })
    }
    
    const updated = [...currentItemsList, ...itemsToCreate]
    updateCurrentItems(updated)
}

/**
 * Обрезает элементы до capacity при изменении размеров сетки
 */
const trimItems = (): void => {
    while (getCurrentItems().length > capacity.value) {
        removeItem()
    }
}

/**
 * Создает новую папку в текущем уровне
 */
const createFolder = (): void => {
    const currentItemsList = getCurrentItems()
    if (currentItemsList.length >= capacity.value) {
        return
    }
    
    if (gridRef.value && typeof gridRef.value.createFolder === 'function') {
        gridRef.value.createFolder()
    } else {
        const newFolder: GridItem = {
            id: generateId(),
            name: 'Новая папка',
            type: 'folder',
            children: []
        }
        const updated = [...currentItemsList]
        updated.push(newFolder)
        updateCurrentItems(updated)
    }
}

/**
 * Проверяет, является ли элемент папкой
 * @param {GridItem} item - Элемент для проверки
 * @returns {boolean} true если элемент является папкой
 */
const isFolder = (item: GridItem | null | undefined): item is GridItem => {
    return item !== null && item !== undefined && (item.type === 'folder' || Array.isArray(item.children))
}

/**
 * Проверяет, не пуста ли папка
 * @param {GridItem} item - Элемент для проверки
 * @returns {boolean} true если папка содержит элементы
 */
const isFolderNotEmpty = (item: GridItem): boolean => {
    if (!isFolder(item)) return false
    const children = item.children || []
    return children.length > 0
}

/**
 * Рекурсивно подсчитывает количество элементов в папке
 * @param {GridItem} item - Папка для подсчета
 * @returns {number} Количество элементов в папке
 */
const countItemsInFolder = (item: GridItem): number => {
    if (!isFolder(item)) return 0
    const children = item.children || []
    let count = children.length
    children.forEach(child => {
        if (isFolder(child)) {
            count += countItemsInFolder(child)
        }
    })
    return count
}

/**
 * Обработчик удаления элемента
 * @param {GridItem} item - Элемент для удаления
 * @param {number} index - Индекс элемента
 * @param {number[]} path - Путь к элементу в структуре
 */
const onDelete = (item: GridItem, index: number, path: number[]) => {
    deleteTarget.value = item
    deleteIndex.value = index
    deletePath.value = path || []
    
    if (isFolder(item) && isFolderNotEmpty(item)) {
        showDeleteModal.value = true
    } else {
        performDelete()
    }
}

/**
 * Подтверждение удаления элемента
 */
const confirmDelete = (): void => {
    performDelete()
    cancelDelete()
}

/**
 * Отмена удаления элемента
 */
const cancelDelete = (): void => {
    showDeleteModal.value = false
    deleteTarget.value = null
    deleteIndex.value = null
    deletePath.value = []
}

/**
 * Выполняет удаление элемента из структуры
 */
const performDelete = (): void => {
    if (deleteIndex.value === null || !deleteTarget.value) return
    
    let current = items.value
    for (const pathIndex of deletePath.value) {
        const folder = current[pathIndex]
        if (folder && isFolder(folder)) {
            current = folder.children || []
        } else {
            return
        }
    }
    
    current.splice(deleteIndex.value, 1)
    
    if (deletePath.value.length === 0) {
        items.value = [...current]
    } else {
        const updated = [...items.value]
        let target = updated
        
        for (let i = 0; i < deletePath.value.length - 1; i++) {
            const idx = deletePath.value[i]
            target = target[idx].children || []
        }
        
        const lastIdx = deletePath.value[deletePath.value.length - 1]
        if (target[lastIdx]) {
            target[lastIdx].children = [...current]
            items.value = updated
        }
    }
}

/**
 * Обработчик входа в папку
 * @param {GridItem} folder - Папка, в которую произошел вход
 */
const onEnterFolder = (folder: GridItem): void => {
    console.log('onEnterFolder', folder)
}

</script>

<style scoped lang="less">
.sample-cell {
    min-height: 48px;
    min-width: 48px;
    background: rgb(95, 95, 95);
    border: 1px solid rgb(0, 112, 19);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: white;
    font-weight: bold;
}

.inputs {
    padding: 12pt;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

button {
    padding: 8px 16px;
    margin: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background: #f0f0f0;
    }
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 24px;
    border-radius: 8px;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    h3 {
        margin-top: 0;
        margin-bottom: 16px;
        color: #333;
    }

    p {
        margin-bottom: 16px;
        color: #666;
        line-height: 1.5;
    }
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.btn-alert {
    background: #dc3545;
    color: white;
    border: none;

    &:hover {
        background: #c82333;
    }
}
</style>
