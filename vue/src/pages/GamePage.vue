<template>
  <div class="game-view">
    <div
      ref="gameZone"
      class="game-view__zone"
      tabindex="0"
      @click="handleClick"
      @keydown="handleKeyDown"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"
    >
      <Zone
        v-for="(zone, index) in levelData.zones"
        :key="index"
        :points="zone.points"
      />
      <Enemy
        v-for="(enemy, index) in enemies"
        :key="`enemy${enemy.position.x}${enemy.position.y}${index}`"
        :position="enemy.position"
        :selected="enemy.selected"
        :health="enemy.health"
        @click="selectEnemy(index)"
      />
      <Tower
        v-for="tower in towers"
        :key="`tower${tower.position.x}${tower.position.y}`"
        :position="tower.position"
        :radius="tower.radius"
        :level="tower.level"
        :target="tower.target"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';

import Enemy from '@/components/Enemy.vue';
import Tower from '@/components/Tower.vue';
import Zone from '@/components/Zone.vue';
import { LEVELS, LONG_PRESS_DURATION, MAPS } from '@/shared/constants';
import { Point, TowerModel, EnemyModel } from '@/shared/models';
import { createGameLoop } from '@/shared/utils';

const gameZone = ref(null);
const currentLevel = ref(1);
const towers = ref([]);
const enemies = ref([]);
const selectedEnemy = ref(null);
const longPressTimer = ref(null);
const cursorPoint = ref(null);

const route = useRoute();

watch(
  () => route.params.id,
  (id) => {
    const parsedId = parseInt(id);
    if (!isNaN(parsedId) && LEVELS.some((level) => level.id === parsedId)) {
      currentLevel.value = parsedId;
    } else {
      currentLevel.value = levels.value[0].id;
    }
  },
  { immediate: true }
);

const levelData = computed(() => {
  return MAPS.find((map) => map.id === currentLevel.value);
});

const onMouseDown = (event) => {
  const rect = gameZone.value.getBoundingClientRect();
  cursorPoint.value = new Point(
    event.clientX - rect.left,
    event.clientY - rect.top
  );

  longPressTimer.value = setTimeout(() => {
    deleteObject(cursorPoint.value);
    longPressTimer.value = null;
  }, LONG_PRESS_DURATION);
};

const onMouseUp = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
};

const onMouseLeave = () => {
  onMouseUp();
};

const deleteObject = (point) => {
  const enemyIndex = enemies.value.findIndex(
    (enemy) =>
      Math.abs(enemy.position.x - point.x) < 20 &&
      Math.abs(enemy.position.y - point.y) < 20
  );

  if (enemyIndex !== -1) {
    if (selectedEnemy.value === enemyIndex) {
      selectedEnemy.value = null;
    }
    enemies.value.splice(enemyIndex, 1);
    return;
  }

  const towerIndex = towers.value.findIndex(
    (tower) =>
      Math.abs(tower.position.x - point.x) < 20 &&
      Math.abs(tower.position.y - point.y) < 20
  );

  if (towerIndex !== -1) {
    towers.value.splice(towerIndex, 1);
    return;
  }
};

const handleClick = (event) => {
  const rect = gameZone.value.getBoundingClientRect();
  const clickPoint = new Point(
    event.clientX - rect.left,
    event.clientY - rect.top
  );

  const clickPointPercent = new Point(
    (clickPoint.x / rect.width) * 100,
    (clickPoint.y / rect.height) * 100
  );

  const canBuild = levelData.value.zones.some((zone) =>
    zone.contains(clickPointPercent)
  );

  if (canBuild) {
    const isPositionTaken = [...towers.value, ...enemies.value].some(
      (obj) =>
        Math.abs(obj.position.x - clickPoint.x) < 20 &&
        Math.abs(obj.position.y - clickPoint.y) < 20
    );

    if (!isPositionTaken) {
      towers.value.push(new TowerModel(clickPoint));
    }
  } else {
    enemies.value.push(new EnemyModel(clickPoint));
  }
};

const selectEnemy = (index) => {
  if (selectedEnemy.value === index) {
    selectedEnemy.value = null;
  } else {
    selectedEnemy.value = index;
  }
  enemies.value.forEach((enemy, i) => {
    enemy.selected = i === selectedEnemy.value;
  });
};

const handleKeyDown = (event) => {
  if (selectedEnemy.value === null) return;

  const enemy = enemies.value[selectedEnemy.value];
  if (!enemy) return;

  enemy.move(event.key);
};

const updateGame = (deltaTime) => {
  towers.value.forEach((tower) => {
    tower.update(deltaTime);
    if (!tower.canAttack()) return;

    let targetEnemy;
    let minDistanceSquared = Infinity;

    enemies.value.forEach((enemy) => {
      const deltaX = enemy.position.x - tower.position.x;
      const deltaY = enemy.position.y - tower.position.y;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY;

      if (
        distanceSquared <= tower.radius * tower.radius &&
        distanceSquared < minDistanceSquared
      ) {
        minDistanceSquared = distanceSquared;
        targetEnemy = enemy;
      }
    });

    if (targetEnemy) {
      const damage = tower.attack(targetEnemy);

      if (targetEnemy.takeDamage(damage)) {
        const enemyIndex = enemies.value.indexOf(targetEnemy);
        if (enemyIndex !== -1) {
          enemies.value.splice(enemyIndex, 1);

          if (selectedEnemy.value === enemyIndex) {
            selectedEnemy.value = null;
          }
        }

        tower.increaseKills();
      }
    } else {
      tower.target = null;
    }
  });
};

const { start, stop } = createGameLoop(updateGame);

onMounted(() => {
  start();
});

onBeforeUnmount(() => {
  stop();
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
  }
});
</script>

<style lang="scss">
.game-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 78px);
  inline-size: 100%;
}

.game-view__zone {
  position: relative;
  flex-grow: 1;
  background-color: rgba(0, 0, 20, 0.4);
  overflow: hidden;

  &:focus {
    outline: none;
  }
}
</style>
