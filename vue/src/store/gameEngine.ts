import { REWARDS_BY_TYPE, SELECT_THRESHOLD_PX } from './constants';

import {
  Point,
  TowerModel,
  EnemyModel,
  ZoneModel,
  ShooterEnemyModel,
  AllyModel,
  BarricadeModel,
  ArtilleryStrikeModel,
} from '@/shared/models';
import { EnemyType } from '@/shared/types';
import {
  ZoneSize,
  State,
  SpawnConfig,
  SpawnState,
  GameResult,
} from '@/store/types';

const toPercent = (point: Point, size: ZoneSize): Point =>
  new Point((point.x / size.width) * 100, (point.y / size.height) * 100);

const percentToPixel = (point: Point, size: ZoneSize): Point =>
  new Point((point.x / 100) * size.width, (point.y / 100) * size.height);

const isNear = (a: Point, b: Point, threshold = SELECT_THRESHOLD_PX): boolean =>
  Math.abs(a.x - b.x) < threshold && Math.abs(a.y - b.y) < threshold;

export const computePathPixel = (
  zoneSize: ZoneSize | null,
  pathPercent: Point[]
): Point[] => {
  if (!zoneSize) return [];
  return pathPercent.map((p) => percentToPixel(p, zoneSize));
};

export const computeReversePathPixel = (
  zoneSize: ZoneSize | null,
  pathPercent: Point[]
): Point[] => {
  if (!zoneSize) return [];
  return pathPercent
    .slice()
    .reverse()
    .map((p) => percentToPixel(p, zoneSize));
};

export const placeTowerIfAllowed = (params: {
  towers: TowerModel[];
  enemies: EnemyModel[];
  buildZones: ZoneModel[];
  zoneSize: ZoneSize | null;
  point: Point;
  installCost?: number;
}): TowerModel[] | null => {
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
};

export const deleteObjectAt = (params: {
  towers: TowerModel[];
  enemies: EnemyModel[];
  selectedEnemyIndex: number | null;
  point: Point;
  threshold?: number;
}): {
  towers: TowerModel[];
  enemies: EnemyModel[];
  selectedEnemyIndex: number | null;
} => {
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
};

export const placeBarricadeIfAllowed = (params: {
  barricades: BarricadeModel[];
  enemies: EnemyModel[];
  pathPixel: Point[];
  startPoint: Point;
  endPoint: Point;
  barricadeType?: 'wooden' | 'stone' | 'metal';
}): BarricadeModel[] | null => {
  const {
    barricades,
    enemies,
    pathPixel,
    startPoint,
    endPoint,
    barricadeType = 'wooden',
  } = params;

  const threshold = 50;
  const onPath = pathPixel.some((p) => {
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) return isNear(p, startPoint, threshold);

    const t = Math.max(
      0,
      Math.min(
        1,
        ((p.x - startPoint.x) * dx + (p.y - startPoint.y) * dy) /
          (length * length)
      )
    );

    const closestX = startPoint.x + t * dx;
    const closestY = startPoint.y + t * dy;
    const distance = Math.hypot(p.x - closestX, p.y - closestY);

    return distance <= threshold;
  });

  if (!onPath) return null;

  const center = new Point(
    (startPoint.x + endPoint.x) / 2,
    (startPoint.y + endPoint.y) / 2
  );

  const isTaken =
    barricades.some((b) => isNear(b.position, center, 20)) ||
    enemies.some((e) => isNear(e.position, center, 20));
  if (isTaken) return null;

  const newBarricade = new BarricadeModel(startPoint, endPoint, barricadeType);
  return [...barricades, newBarricade];
};

export const createArtilleryStrike = (
  point: Point
): ArtilleryStrikeModel | null =>
  new ArtilleryStrikeModel(new Point(point.x, point.y));

export const upgradeTowerAt = (params: {
  towers: TowerModel[];
  point: Point;
  money: number;
  baseCost: number;
  threshold?: number;
}): { towers: TowerModel[]; money: number } | null => {
  const { towers, point, money, baseCost, threshold } = params;

  const idx = towers.findIndex((t) => isNear(t.position, point, threshold));
  if (idx === -1) return null;

  const tower = towers[idx];
  const upgradeCost = baseCost + tower.level * baseCost;
  if (money < upgradeCost) return null;

  const nextTowers = towers.slice();
  nextTowers[idx].upgrade(upgradeCost);

  return { towers: nextTowers, money: money - upgradeCost };
};

const buildEnemyFromConfig = (
  cfg: SpawnConfig,
  index: number,
  start: Point,
  pixelPath: Point[]
): EnemyModel | ShooterEnemyModel => {
  let type: EnemyType | 'shooter_light' | 'shooter_medium' | 'shooter_heavy' =
    cfg.type;
  let speed = cfg.speed;
  let health = cfg.health;
  let reward = cfg.reward;

  if (cfg.enemies?.length) {
    const e = cfg.enemies[Math.min(index, cfg.enemies.length - 1)];
    if (e) {
      type = e.type ?? type;
      speed = e.speed ?? speed;
      health = e.health ?? health;
      reward = e.reward ?? reward;
    }
  }

  const position = new Point(start.x, start.y);

  if (
    type === 'shooter_light' ||
    type === 'shooter_medium' ||
    type === 'shooter_heavy'
  ) {
    const shooter = new ShooterEnemyModel(
      position,
      type,
      speed,
      health,
      reward
    );
    shooter.setPath(pixelPath);
    return shooter;
  }

  const enemy = new EnemyModel(
    position,
    type as EnemyType,
    speed,
    health,
    reward
  );
  enemy.setPath(pixelPath);
  return enemy;
};

export const spawnOneEnemy = (
  state: Pick<
    State,
    'pathPixel' | 'spawnConfig' | 'spawnState' | 'enemies' | 'shooterEnemies'
  >
): {
  enemies: EnemyModel[];
  shooterEnemies: ShooterEnemyModel[];
  spawnState: SpawnState;
} | null => {
  if (!state.pathPixel.length || !state.spawnConfig) return null;

  const start = state.pathPixel[0];
  const enemy = buildEnemyFromConfig(
    state.spawnConfig,
    state.spawnState.index,
    start,
    state.pathPixel
  );

  const nextEnemies = [...state.enemies];
  const nextShooterEnemies = [...state.shooterEnemies];

  if (enemy instanceof ShooterEnemyModel) {
    nextShooterEnemies.push(enemy);
  } else {
    nextEnemies.push(enemy);
  }

  const nextIndex = state.spawnConfig.enemies?.length
    ? state.spawnState.index + 1
    : state.spawnState.index;

  return {
    enemies: nextEnemies,
    shooterEnemies: nextShooterEnemies,
    spawnState: { ...state.spawnState, index: nextIndex },
  };
};

export const computeNextTick = (
  state: State,
  deltaTime: number
): {
  towers: TowerModel[];
  enemies: EnemyModel[];
  shooterEnemies: ShooterEnemyModel[];
  allies: AllyModel[];
  barricades: BarricadeModel[];
  artilleryStrikes: ArtilleryStrikeModel[];
  selectedEnemyIndex: number | null;
  money: number;
  spawnState: SpawnState;
  gameOver: boolean;
  gameResult: GameResult | null;
} => {
  if (state.gameResult) {
    return {
      ...state,
      selectedEnemyIndex: state.selectedEnemyIndex ?? null,
      gameOver: true,
      gameResult: state.gameResult,
    };
  }

  let money = state.money;
  let gameOver = false;
  let gameResult: GameResult | null = null;

  let { timer, remaining, index } = state.spawnState;
  const enemies = state.enemies.slice();
  const shooterEnemies = state.shooterEnemies.slice();
  const allies = state.allies.slice();
  const barricades = state.barricades.slice();
  const artilleryStrikes = state.artilleryStrikes.slice();

  if (state.spawnConfig) {
    const interval = state.spawnConfig.interval;
    timer += deltaTime;

    while (remaining > 0 && timer >= interval) {
      timer -= interval;
      remaining -= 1;

      const start = state.pathPixel[0];
      if (!start) continue;

      const enemy = buildEnemyFromConfig(
        state.spawnConfig,
        index,
        start,
        state.pathPixel
      );

      if (enemy instanceof ShooterEnemyModel) {
        shooterEnemies.push(enemy);
      } else {
        enemies.push(enemy);
      }

      if (state.spawnConfig.enemies?.length) {
        index += 1;
      }
    }
  }

  const nextSpawnState: SpawnState = { timer, remaining, index };

  for (let i = artilleryStrikes.length - 1; i >= 0; i--) {
    const strike = artilleryStrikes[i];
    const isComplete = strike.update(deltaTime);

    if (strike.elapsed < 100) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        const damage = strike.calculateDamage(enemy.position);
        if (damage > 0 && enemy.takeDamage(damage)) {
          enemies.splice(j, 1);
          money += REWARDS_BY_TYPE[enemy.type] ?? enemy.reward;
        }
      }

      for (let j = shooterEnemies.length - 1; j >= 0; j--) {
        const enemy = shooterEnemies[j];
        const damage = strike.calculateDamage(enemy.position);
        if (damage > 0 && enemy.takeDamage(damage)) {
          shooterEnemies.splice(j, 1);
          money += enemy.reward;
        }
      }
    }

    if (isComplete) {
      artilleryStrikes.splice(i, 1);
    }
  }

  let selectedIndex = state.selectedEnemyIndex;

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];

    let blockedByBarricade = false;
    for (const barricade of barricades) {
      if (barricade.intersects(enemy.position, 15)) {
        blockedByBarricade = true;
        break;
      }
    }

    if (!blockedByBarricade) {
      const reachedEnd = enemy.update(deltaTime);
      if (reachedEnd) {
        enemies.splice(i, 1);
        if (selectedIndex === i) selectedIndex = null;
        gameOver = true;
        gameResult = 'lose';
      }
    }
  }

  const towers = state.towers.slice();

  for (let i = shooterEnemies.length - 1; i >= 0; i--) {
    const shooter = shooterEnemies[i];

    let hasAllyInRange = false;
    for (const ally of allies) {
      const dx = ally.position.x - shooter.position.x;
      const dy = ally.position.y - shooter.position.y;
      const dist2 = dx * dx + dy * dy;
      const combatRange = ally.attackRadius + 20;

      if (dist2 <= combatRange * combatRange) {
        hasAllyInRange = true;
        break;
      }
    }

    let hasTowerInRange = false;
    for (const tower of towers) {
      const dx = tower.position.x - shooter.position.x;
      const dy = tower.position.y - shooter.position.y;
      const dist2 = dx * dx + dy * dy;

      if (dist2 <= shooter.shootRadius * shooter.shootRadius) {
        hasTowerInRange = true;
        break;
      }
    }

    if (!hasAllyInRange && !hasTowerInRange) {
      let blockedByBarricade = false;
      for (const barricade of barricades) {
        if (barricade.intersects(shooter.position, 15)) {
          blockedByBarricade = true;
          break;
        }
      }

      if (!blockedByBarricade) {
        const reachedEnd = shooter.update(deltaTime);
        if (reachedEnd) {
          shooterEnemies.splice(i, 1);
          gameOver = true;
          gameResult = 'lose';
          continue;
        }
      }
    }

    shooter.updateShooting(deltaTime);
    if (!shooter.canShoot()) continue;

    let bestTarget: { obj: TowerModel | AllyModel; dist2: number } | null =
      null;

    for (const tower of towers) {
      const dx = tower.position.x - shooter.position.x;
      const dy = tower.position.y - shooter.position.y;
      const d2 = dx * dx + dy * dy;
      if (
        d2 <= shooter.shootRadius * shooter.shootRadius &&
        (!bestTarget || d2 < bestTarget.dist2)
      ) {
        bestTarget = { obj: tower, dist2: d2 };
      }
    }

    for (const ally of allies) {
      const dx = ally.position.x - shooter.position.x;
      const dy = ally.position.y - shooter.position.y;
      const d2 = dx * dx + dy * dy;
      if (
        d2 <= shooter.shootRadius * shooter.shootRadius &&
        (!bestTarget || d2 < bestTarget.dist2)
      ) {
        bestTarget = { obj: ally, dist2: d2 };
      }
    }

    if (bestTarget) {
      shooter.shoot(bestTarget.obj.position);
      if (bestTarget.obj.takeDamage(shooter.shootDamage)) {
        if (bestTarget.obj instanceof TowerModel) {
          const towerIndex = towers.indexOf(bestTarget.obj);
          if (towerIndex !== -1) {
            towers.splice(towerIndex, 1);
          }
        }
      }
    } else {
      shooter.shootTarget = null;
    }
  }

  for (let i = allies.length - 1; i >= 0; i--) {
    const ally = allies[i];

    if (ally.health <= 0) {
      allies.splice(i, 1);
      continue;
    }

    ally.updateAttackCooldown(deltaTime);
    let bestShooterIndex = -1;
    let minDist2 = Infinity;

    for (let j = 0; j < shooterEnemies.length; j++) {
      const shooter = shooterEnemies[j];
      const dx = shooter.position.x - ally.position.x;
      const dy = shooter.position.y - ally.position.y;
      const d2 = dx * dx + dy * dy;

      if (d2 <= ally.attackRadius * ally.attackRadius && d2 < minDist2) {
        minDist2 = d2;
        bestShooterIndex = j;
      }
    }

    if (bestShooterIndex !== -1) {
      const target = shooterEnemies[bestShooterIndex];

      if (ally.canAttack()) {
        const damage = ally.attack(target.position);
        if (target.takeDamage(damage)) {
          shooterEnemies.splice(bestShooterIndex, 1);
          money += target.reward;
        }
      }
    } else {
      ally.target = null;
      const reachedEnd = ally.update(deltaTime);
      if (reachedEnd) {
        allies.splice(i, 1);
        continue;
      }
    }
  }

  for (let i = barricades.length - 1; i >= 0; i--) {
    const barricade = barricades[i];
    let damaged = false;

    for (const enemy of enemies) {
      if (barricade.intersects(enemy.position, 15)) {
        if (barricade.takeDamage(5 * (deltaTime / 1000))) {
          barricades.splice(i, 1);
          damaged = true;
          break;
        }
      }
    }

    if (damaged) continue;

    for (const shooter of shooterEnemies) {
      if (barricade.intersects(shooter.position, 15)) {
        if (barricade.takeDamage(3 * (deltaTime / 1000))) {
          barricades.splice(i, 1);
          break;
        }
      }
    }
  }

  if (!gameOver) {
    towers.forEach((tower) => {
      tower.update(deltaTime);
      if (!tower.canAttack()) return;

      let bestEnemyIndex = -1;
      let bestShooterIndex = -1;
      let minDist2 = Infinity;

      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dx = e.position.x - tower.position.x;
        const dy = e.position.y - tower.position.y;
        const d2 = dx * dx + dy * dy;

        if (d2 <= tower.radius * tower.radius && d2 < minDist2) {
          minDist2 = d2;
          bestEnemyIndex = i;
          bestShooterIndex = -1;
        }
      }

      for (let i = 0; i < shooterEnemies.length; i++) {
        const e = shooterEnemies[i];
        const dx = e.position.x - tower.position.x;
        const dy = e.position.y - tower.position.y;
        const d2 = dx * dx + dy * dy;

        if (d2 <= tower.radius * tower.radius && d2 < minDist2) {
          minDist2 = d2;
          bestEnemyIndex = -1;
          bestShooterIndex = i;
        }
      }

      if (bestEnemyIndex !== -1) {
        const target = enemies[bestEnemyIndex];
        const damage = tower.attack(target);
        if (target.takeDamage(damage)) {
          enemies.splice(bestEnemyIndex, 1);
          if (selectedIndex === bestEnemyIndex) selectedIndex = null;
          money += REWARDS_BY_TYPE[target.type] ?? target.reward;
          tower.increaseKills();
        }
      } else if (bestShooterIndex !== -1) {
        const target = shooterEnemies[bestShooterIndex];
        const damage = tower.attack(target);
        if (target.takeDamage(damage)) {
          shooterEnemies.splice(bestShooterIndex, 1);
          money += target.reward;
          tower.increaseKills();
        }
      } else {
        tower.target = null;
      }
    });
  }

  if (!gameOver) {
    const noMoreSpawns = nextSpawnState.remaining <= 0;
    if (noMoreSpawns && enemies.length === 0 && shooterEnemies.length === 0) {
      gameOver = true;
      gameResult = 'win';
    }
  }

  return {
    towers,
    enemies,
    shooterEnemies,
    allies,
    barricades,
    artilleryStrikes,
    selectedEnemyIndex: selectedIndex ?? null,
    money,
    spawnState: nextSpawnState,
    gameOver,
    gameResult,
  };
};
