import { REWARDS_BY_TYPE, SELECT_THRESHOLD_PX } from './constants';

import { Point, TowerModel, EnemyModel, ZoneModel } from '@/shared/models';
import { EnemyType } from '@/shared/types';
import {
  ZoneSize,
  State,
  SpawnConfig,
  SpawnState,
  GameResult,
} from '@/store/types';

function toPercent(point: Point, size: ZoneSize): Point {
  return new Point((point.x / size.width) * 100, (point.y / size.height) * 100);
}

function percentToPixel(point: Point, size: ZoneSize): Point {
  return new Point((point.x / 100) * size.width, (point.y / 100) * size.height);
}

function isNear(a: Point, b: Point, threshold = SELECT_THRESHOLD_PX): boolean {
  return Math.abs(a.x - b.x) < threshold && Math.abs(a.y - b.y) < threshold;
}

export function computePathPixel(
  zoneSize: ZoneSize | null,
  pathPercent: Point[]
): Point[] {
  if (!zoneSize) return [];
  return pathPercent.map((p) => percentToPixel(p, zoneSize));
}

export function placeTowerIfAllowed(params: {
  towers: TowerModel[];
  enemies: EnemyModel[];
  buildZones: ZoneModel[];
  zoneSize: ZoneSize | null;
  point: Point;
  installCost?: number;
}): TowerModel[] | null {
  const { towers, enemies, buildZones, zoneSize, point, installCost } = params;
  if (!zoneSize) return null;

  const pointPercent = toPercent(point, zoneSize);
  const canBuild = buildZones.some((zone) => zone.contains(pointPercent));
  if (!canBuild) return null;

  const isTaken =
    towers.some((t) => isNear(t.position, point)) ||
    enemies.some((e) => isNear(e.position, point));
  if (isTaken) return null;

  const newTower = new TowerModel(
    new Point(point.x, point.y),
    1,
    installCost ?? 0
  );
  return [...towers, newTower];
}

export function deleteObjectAt(params: {
  towers: TowerModel[];
  enemies: EnemyModel[];
  selectedEnemyIndex: number | null;
  point: Point;
  threshold?: number;
}): {
  towers: TowerModel[];
  enemies: EnemyModel[];
  selectedEnemyIndex: number | null;
} {
  const { towers, enemies, selectedEnemyIndex, point, threshold } = params;

  const enemyIndex = enemies.findIndex((e) =>
    isNear(e.position, point, threshold)
  );
  if (enemyIndex !== -1) {
    const nextEnemies = enemies.slice();
    nextEnemies.splice(enemyIndex, 1);
    return {
      towers,
      enemies: nextEnemies,
      selectedEnemyIndex:
        selectedEnemyIndex === enemyIndex ? null : selectedEnemyIndex,
    };
  }

  const towerIndex = towers.findIndex((t) =>
    isNear(t.position, point, threshold)
  );
  if (towerIndex !== -1) {
    const nextTowers = towers.slice();
    nextTowers.splice(towerIndex, 1);
    return { towers: nextTowers, enemies, selectedEnemyIndex };
  }

  return { towers, enemies, selectedEnemyIndex };
}

export function upgradeTowerAt(params: {
  towers: TowerModel[];
  point: Point;
  money: number;
  baseCost: number;
  threshold?: number;
}): { towers: TowerModel[]; money: number } | null {
  const { towers, point, money, baseCost, threshold } = params;

  const idx = towers.findIndex((t) => isNear(t.position, point, threshold));
  if (idx === -1) return null;

  const tower = towers[idx];
  const upgradeCost = baseCost + tower.level * baseCost;
  if (money < upgradeCost) return null;

  const nextTowers = towers.slice();
  nextTowers[idx].upgrade(upgradeCost);

  return { towers: nextTowers, money: money - upgradeCost };
}

function buildEnemyFromConfig(
  cfg: SpawnConfig,
  index: number,
  start: Point,
  pixelPath: Point[]
): EnemyModel {
  let type: EnemyType = cfg.type;
  let speed = cfg.speed;
  let health = cfg.health;
  let reward = cfg.reward;

  if (cfg.enemies && Array.isArray(cfg.enemies) && cfg.enemies.length > 0) {
    const e = cfg.enemies[Math.min(index, cfg.enemies.length - 1)] || {};
    type = (e.type ?? type) as EnemyType;
    speed = e.speed ?? speed;
    health = e.health ?? health;
    reward = e.reward ?? reward;
  }

  const enemy = new EnemyModel(
    new Point(start.x, start.y),
    type,
    speed,
    health,
    reward
  );
  enemy.setPath(pixelPath);
  return enemy;
}

export function spawnOneEnemy(
  state: Pick<State, 'pathPixel' | 'spawnConfig' | 'spawnState' | 'enemies'>
): {
  enemies: EnemyModel[];
  spawnState: SpawnState;
} | null {
  if (!state.pathPixel.length || !state.spawnConfig) return null;
  const start = state.pathPixel[0];
  const enemy = buildEnemyFromConfig(
    state.spawnConfig,
    state.spawnState.index,
    start,
    state.pathPixel
  );

  const nextEnemies = [...state.enemies, enemy];
  let nextIndex = state.spawnState.index;
  if (state.spawnConfig.enemies && state.spawnConfig.enemies.length > 0) {
    nextIndex += 1;
  }
  const nextSpawnState: SpawnState = { ...state.spawnState, index: nextIndex };
  return { enemies: nextEnemies, spawnState: nextSpawnState };
}

export function computeNextTick(
  state: State,
  deltaTime: number
): {
  towers: TowerModel[];
  enemies: EnemyModel[];
  selectedEnemyIndex: number | null;
  money: number;
  spawnState: SpawnState;
  gameOver: boolean;
  gameResult: GameResult | null;
} {
  if (state.gameResult) {
    return {
      towers: state.towers,
      enemies: state.enemies,
      selectedEnemyIndex: state.selectedEnemyIndex ?? null,
      money: state.money,
      spawnState: state.spawnState,
      gameOver: true,
      gameResult: state.gameResult,
    };
  }

  let money = state.money;
  let gameOver = false;
  let gameResult: GameResult | null = null;

  let { timer, remaining, index } = state.spawnState;
  const enemies = state.enemies.slice();

  if (state.spawnConfig) {
    const interval = state.spawnConfig.interval;
    timer += deltaTime;

    while (remaining > 0 && timer >= interval) {
      timer -= interval;
      remaining -= 1;

      const start = state.pathPixel[0];
      if (start) {
        const enemy = buildEnemyFromConfig(
          state.spawnConfig,
          index,
          start,
          state.pathPixel
        );
        enemies.push(enemy);
        if (state.spawnConfig.enemies && state.spawnConfig.enemies.length > 0) {
          index += 1;
        }
      }
    }
  }

  const nextSpawnState: SpawnState = { timer, remaining, index };

  let selectedIndex = state.selectedEnemyIndex;
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const reachedEnd = enemy.update(deltaTime);
    if (reachedEnd) {
      enemies.splice(i, 1);
      if (selectedIndex === i) selectedIndex = null;
      gameOver = true;
      gameResult = 'lose';
    }
  }

  const towers = state.towers.slice();
  if (!gameOver) {
    towers.forEach((tower) => {
      tower.update(deltaTime);
      if (!tower.canAttack()) return;

      let bestIndex = -1;
      let minDist2 = Infinity;

      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dx = e.position.x - tower.position.x;
        const dy = e.position.y - tower.position.y;
        const d2 = dx * dx + dy * dy;

        if (d2 <= tower.radius * tower.radius && d2 < minDist2) {
          minDist2 = d2;
          bestIndex = i;
        }
      }

      if (bestIndex !== -1) {
        const target = enemies[bestIndex];
        const damage = tower.attack(target);
        if (target.takeDamage(damage)) {
          enemies.splice(bestIndex, 1);
          if (selectedIndex === bestIndex) selectedIndex = null;
          const reward = REWARDS_BY_TYPE[target.type] ?? (target.reward || 0);
          money += reward;
          tower.increaseKills();
        }
      } else {
        tower.target = null;
      }
    });
  }

  if (!gameOver) {
    const noMoreSpawns = nextSpawnState.remaining <= 0;
    if (noMoreSpawns && enemies.length === 0) {
      gameOver = true;
      gameResult = 'win';
    }
  }

  return {
    towers,
    enemies,
    selectedEnemyIndex: selectedIndex ?? null,
    money,
    spawnState: nextSpawnState,
    gameOver,
    gameResult,
  };
}
