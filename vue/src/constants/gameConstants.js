export const LEVEL_KEYS = {
  FIRST: 'firstLevel',
  SECOND: 'secondLevel'
}

export const TOWER_TYPES = {
  BASIC: 'basic',
  SNIPER: 'sniper',
  RAPID: 'rapid'
}

export const ENEMY_TYPES = {
  BASIC: 'basic'
}

export const MUTATION_TYPES = {
  SET_LEVEL: 'SET_LEVEL',
  SET_BUILD_MODE: 'SET_BUILD_MODE',
  SET_SELECTED_TOWER_ID: 'SET_SELECTED_TOWER_ID',
  SET_SELECTED_ENEMY_ID: 'SET_SELECTED_ENEMY_ID',
  SET_DRAGGING_ENEMY_ID: 'SET_DRAGGING_ENEMY_ID',
  SET_GOLD: 'SET_GOLD',
  BUILD_TOWER: 'BUILD_TOWER',
  UPGRADE_TOWER: 'UPGRADE_TOWER',
  REMOVE_TOWER: 'REMOVE_TOWER',
  SPAWN_ENEMY: 'SPAWN_ENEMY',
  UPDATE_ENEMY_POSITION: 'UPDATE_ENEMY_POSITION',
  REMOVE_ENEMY: 'REMOVE_ENEMY',
  RESET_LEVEL: 'RESET_LEVEL',
  APPLY_DAMAGE_STEP: 'APPLY_DAMAGE_STEP'
}

export const ACTION_TYPES = {
  INIT_LEVEL: 'initLevel',
  RESET_LEVEL: 'resetLevel',
  TOGGLE_BUILD_MODE: 'toggleBuildMode',
  SLOT_CLICK: 'slotClick',
  TOWER_CLICK: 'towerClick',
  BUILD_TOWER: 'buildTower',
  UPGRADE_TOWER: 'upgradeTower',
  REMOVE_TOWER: 'removeTower',
  SPAWN_ENEMY: 'spawnEnemy',
  ENEMY_POINTER_DOWN: 'enemyPointerDown',
  CANVAS_POINTER_MOVE: 'canvasPointerMove',
  CANVAS_POINTER_UP: 'canvasPointerUp',
  RUN_DAMAGE_STEP: 'runDamageStep'
}

export const TOWER_CONFIG = {
  [TOWER_TYPES.BASIC]: {
    title: 'Basic',
    price: 100,
    refund: 50,
    levels: {
      1: {
        damage: 12,
        range: 90
      },
      2: {
        damage: 18,
        range: 105
      },
      3: {
        damage: 26,
        range: 120
      }
    }
  },

  [TOWER_TYPES.SNIPER]: {
    title: 'Sniper',
    price: 140,
    refund: 70,
    levels: {
      1: {
        damage: 24,
        range: 150
      },
      2: {
        damage: 34,
        range: 170
      },
      3: {
        damage: 48,
        range: 190
      }
    }
  },

  [TOWER_TYPES.RAPID]: {
    title: 'Rapid',
    price: 120,
    refund: 60,
    levels: {
      1: {
        damage: 8,
        range: 80
      },
      2: {
        damage: 12,
        range: 92
      },
      3: {
        damage: 16,
        range: 108
      }
    }
  }
}

export const UPGRADE_PRICE_BY_LEVEL = {
  1: 70,
  2: 110
}

export const MAX_TOWER_LEVEL = 3
export const DEFAULT_ENEMY_HP = 100
export const ENEMY_REWARD = 50
export const DEFAULT_LEVEL_GOLD = 300