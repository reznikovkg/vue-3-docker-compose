<template>
  <div class="game-view">
    <div
      ref="gameArea"
      class="game-view__game-area"
      @click="handleClick"
      @contextmenu.prevent="handleRightClick"
    >
      <Zone
        v-for="(area, index) in currentLevelData.areas"
        :key="index"
        :points="area.points"
      />

      <Tower
        v-for="tower in towers"
        :key="'tower-' + tower.position.x + '-' + tower.position.y"
        :position="tower.position"
        :range="tower.range"
        :level="tower.level"
        :target="tower.target"
      />

      <Enemy
        v-for="(foe, index) in foes"
        :key="'foe-' + index"
        :position="foe.position"
        :selected="foe.selected"
        :health="foe.health"
        @click="selectFoe(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router'; // Подключаем роутер

import Enemy from '@/components/Enemy.vue';
import Tower from '@/components/Tower.vue';
import Zone from '@/components/Zone.vue';
import {
  Point,
  Area as AreaClass,
  TowerObj,
  Foe as FoeClass,
} from '@/shared/models';


const currentLevel = ref(1);
const levels = ref([
  {
    id: 1,
    areas: [
      new AreaClass([
        new Point(-10, -10),
        new Point(1510, -10),
        new Point(1510, 400),
        new Point(-10, 400),
      ]),
      new AreaClass([
        new Point(-10, 550),
        new Point(1510, 500),
        new Point(1510, 790),
        new Point(-10, 790),
      ]),
    ],
  },
  {
    id: 2,
    areas: [
      new AreaClass([
        new Point(-10, -10),
        new Point(900, -10),
        new Point(600, 300),
        new Point(400, 700),
        new Point(-10, 700),
      ]),
      new AreaClass([
        new Point(1100, 100),
        new Point(1200, 100),
        new Point(1510, 90),
        new Point(1510, 790),
        new Point(1200, 790),
        new Point(1200, 400),
        new Point(1000, 300),
      ]),
      new AreaClass([
        new Point(800, 300),
        new Point(1000, 500),
        new Point(800, 700),
        new Point(600, 700),
      ]),
    ],
  },
]);

const towers = ref([]);
const foes = ref([]);
const selectedFoe = ref(null);
const lastFrameTime = ref(0);
const animationFrameId = ref(null);

// Ref для DOM-элемента
const gameArea = ref(null);

// Получаем текущий маршрут
const route = useRoute();

// Синхронизируем currentLevel с параметром id из URL
watch(
  () => route.params.id,
  (newId) => {
    const parsedId = parseInt(newId, 10);
    if (
      !isNaN(parsedId) &&
      levels.value.some((level) => level.id === parsedId)
    ) {
      currentLevel.value = parsedId;
    } else {
      // Если id некорректный — ставим первый уровень
      currentLevel.value = levels.value[0].id;
    }
  },
  { immediate: true } // Сразу запускаем при монтировании
);

const currentLevelData = computed(() => {
  return levels.value.find((level) => level.id === currentLevel.value);
});

const handleClick = (event) => {
  const rect = gameArea.value.getBoundingClientRect();
  const clickPoint = new Point(
    event.clientX - rect.left,
    event.clientY - rect.top
  );

  const canBuild = currentLevelData.value.areas.some((area) =>
    area.contains(clickPoint)
  );

  if (canBuild) {
    const positionOccupied = [...towers.value, ...foes.value].some(
      (obj) =>
        Math.abs(obj.position.x - clickPoint.x) < 20 &&
        Math.abs(obj.position.y - clickPoint.y) < 20
    );

    if (!positionOccupied) {
      towers.value.push(new TowerObj(clickPoint));
    }
  } else {
    foes.value.push(new FoeClass(clickPoint));
  }
};

const handleRightClick = (event) => {
  const rect = gameArea.value.getBoundingClientRect();
  const clickPoint = new Point(
    event.clientX - rect.left,
    event.clientY - rect.top
  );

  // Удаление башен
  towers.value = towers.value.filter(
    (tower) =>
      Math.abs(tower.position.x - clickPoint.x) >= 20 ||
      Math.abs(tower.position.y - clickPoint.y) >= 20
  );

  // Удаление врагов
  const foeIndex = foes.value.findIndex(
    (foe) =>
      Math.abs(foe.position.x - clickPoint.x) < 20 &&
      Math.abs(foe.position.y - clickPoint.y) < 20
  );

  if (foeIndex !== -1) {
    if (selectedFoe.value === foeIndex) {
      selectedFoe.value = null;
    }
    foes.value.splice(foeIndex, 1);
  }
};

const selectFoe = (index) => {
  if (selectedFoe.value === index) {
    selectedFoe.value = null;
  } else {
    selectedFoe.value = index;
  }
  foes.value.forEach((foe, i) => {
    foe.selected = i === selectedFoe.value;
  });
};

const handleKeyDown = (event) => {
  if (selectedFoe.value === null) return;

  const foe = foes.value[selectedFoe.value];
  if (!foe) return;

  switch (event.key) {
    case 'ArrowUp':
      foe.move('up');
      break;
    case 'ArrowDown':
      foe.move('down');
      break;
    case 'ArrowLeft':
      foe.move('left');
      break;
    case 'ArrowRight':
      foe.move('right');
      break;
  }
};

const startGameLoop = () => {
  lastFrameTime.value = performance.now();
  gameLoop();
};

const stopGameLoop = () => {
  cancelAnimationFrame(animationFrameId.value);
};

const gameLoop = (timestamp) => {
  const deltaTime = timestamp - lastFrameTime.value;
  lastFrameTime.value = timestamp;

  updateGame(deltaTime);
  animationFrameId.value = requestAnimationFrame(gameLoop);
};

const updateGame = (deltaTime) => {
  towers.value.forEach((tower) => {
    if (!tower.canAttack(lastFrameTime.value)) return;

    let closestFoe = null;
    let closestDistance = Infinity;

    foes.value.forEach((foe) => {
      const dx = foe.position.x - tower.position.x;
      const dy = foe.position.y - tower.position.y;
      const distance = dx * dx + dy * dy;

      if (distance <= tower.range * tower.range && distance < closestDistance) {
        closestDistance = distance;
        closestFoe = foe;
      }
    });

    if (closestFoe) {
      const damage = tower.attack(closestFoe, lastFrameTime.value);
      if (closestFoe.takeDamage(damage)) {
        const foeIndex = foes.value.indexOf(closestFoe);
        if (foeIndex !== -1) {
          foes.value.splice(foeIndex, 1);
          if (selectedFoe.value === foeIndex) {
            selectedFoe.value = null;
          }
        }

        tower.kills++;
        if (tower.kills % 10 === 0) {
          tower.levelUp();
        }
      }
    } else {
      tower.target = null;
    }
  });
};

// Жизненные циклы
onMounted(() => {
  startGameLoop();
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  stopGameLoop();
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style lang="scss">
.game-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  inline-size: 100%;

  &__game-area {
    position: relative;
    flex-grow: 1;
    background-color: rgba(0, 0, 20, 0.4);
    overflow: hidden;
  }
}
</style>
