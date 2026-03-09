class TowerDefensePageClass {
  constructor(payload) {
    this.store = payload.store
    this.boardElement = payload.boardElement
    this.currentLevel = payload.currentLevel
    this.draggingEnemyId = payload.draggingEnemyId
    this.enemySpawnX = payload.enemySpawnX
    this.enemySpawnY = payload.enemySpawnY
    this.keyToDelta = payload.keyToDelta
    this.normalizeSpawnCoordinate = payload.normalizeSpawnCoordinate
    this.selectedSlotId = payload.selectedSlotId
    this.simulationIntervalId = payload.simulationIntervalId
    this.tickMs = payload.tickMs
    this.toBoardPoint = payload.toBoardPoint
  }

  focusBoard = () => {
    if (!this.boardElement.value) {
      return
    }
    this.boardElement.value.focus()
  }

  resetSlotSelection = () => {
    const firstSlot = this.currentLevel.value.towerSlots[0]
    this.selectedSlotId.value = firstSlot ? firstSlot.id : null
  }

  resetEnemySpawnPoint = () => {
    this.enemySpawnX.value = Math.round(this.currentLevel.value.enemySpawn.x)
    this.enemySpawnY.value = Math.round(this.currentLevel.value.enemySpawn.y)
  }

  selectLevel = (levelId) => {
    this.store.dispatch('towerDefense/selectLevel', levelId)
    this.resetSlotSelection()
    this.resetEnemySpawnPoint()
    this.focusBoard()
  }

  selectSlot = (slotId) => {
    this.selectedSlotId.value = slotId
    this.focusBoard()
  }

  addTower = () => {
    if (!this.selectedSlotId.value) {
      return
    }
    this.store.dispatch('towerDefense/addTowerAtSlot', this.selectedSlotId.value)
    this.focusBoard()
  }

  upgradeTower = () => {
    if (!this.selectedSlotId.value) {
      return
    }
    this.store.dispatch('towerDefense/upgradeTowerAtSlot', this.selectedSlotId.value)
    this.focusBoard()
  }

  removeTower = () => {
    if (!this.selectedSlotId.value) {
      return
    }
    this.store.dispatch('towerDefense/removeTowerAtSlot', this.selectedSlotId.value)
    this.focusBoard()
  }

  spawnEnemyAtCustomPoint = () => {
    const level = this.currentLevel.value
    const point = {
      x: this.normalizeSpawnCoordinate(this.enemySpawnX.value, level.enemySpawn.x, level.width),
      y: this.normalizeSpawnCoordinate(this.enemySpawnY.value, level.enemySpawn.y, level.height),
    }
    this.store.dispatch('towerDefense/addEnemyAtPoint', point)
    this.focusBoard()
  }

  selectEnemy = (enemyId) => {
    this.store.dispatch('towerDefense/selectEnemy', enemyId)
    this.focusBoard()
  }

  onBoardKeyDown = (event) => {
    const delta = this.keyToDelta[event.key]
    if (!delta) {
      return
    }
    event.preventDefault()
    this.store.dispatch('towerDefense/moveSelectedEnemyByDelta', delta)
  }

  startEnemyDrag = (event, enemyId) => {
    event.preventDefault()
    this.draggingEnemyId.value = enemyId
    this.store.dispatch('towerDefense/selectEnemy', enemyId)
    const point = this.toBoardPoint(event)
    if (!point) {
      return
    }
    this.store.dispatch('towerDefense/moveEnemyToPoint', {
      enemyId,
      point,
    })
    this.focusBoard()
  }

  dragEnemy = (event) => {
    if (!this.draggingEnemyId.value) {
      return
    }
    const point = this.toBoardPoint(event)
    if (!point) {
      return
    }
    this.store.dispatch('towerDefense/moveEnemyToPoint', {
      enemyId: this.draggingEnemyId.value,
      point,
    })
  }

  stopEnemyDrag = () => {
    this.draggingEnemyId.value = null
  }

  runTick = () => {
    this.store.dispatch('towerDefense/runSimulationTick', this.tickMs)
  }

  mount = () => {
    this.resetSlotSelection()
    this.resetEnemySpawnPoint()
    this.focusBoard()
    this.simulationIntervalId.value = window.setInterval(() => this.runTick(), this.tickMs)
    window.addEventListener('mouseup', this.stopEnemyDrag)
  }

  unmount = () => {
    if (this.simulationIntervalId.value) {
      window.clearInterval(this.simulationIntervalId.value)
      this.simulationIntervalId.value = null
    }
    window.removeEventListener('mouseup', this.stopEnemyDrag)
  }
}

export default TowerDefensePageClass
