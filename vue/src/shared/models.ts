import { EnemyType } from './types';

export class ZoneModel {
  points: Point[];

  constructor(points: Point[]) {
    this.points = points;
  }

  contains(point: Point): boolean {
    let inside = false;
    for (
      let i = 0, j = this.points.length - 1;
      i < this.points.length;
      j = i++
    ) {
      const xi = this.points[i].x;
      const yi = this.points[i].y;
      const xj = this.points[j].x;
      const yj = this.points[j].y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
}

export class TowerModel {
  position: Point;
  level: number;
  damage: number;
  radius: number;
  target: Point | null;
  kills: number;
  attackSpeed: number;
  cooldownRemaining: number;
  totalInvested: number;

  constructor(position: Point, level = 1, initialInvestment = 0) {
    this.position = position;
    this.level = level;
    this.damage = 10 * level;
    this.radius = 100 * level;
    this.target = null;
    this.kills = 0;
    this.attackSpeed = 5;
    this.cooldownRemaining = 0;
    this.totalInvested = initialInvestment;
  }

  update(deltaTime: number): void {
    this.cooldownRemaining -= deltaTime;
  }

  canAttack(): boolean {
    return this.cooldownRemaining <= 0;
  }

  attack(target: EnemyModel): number {
    this.target = target.position;
    this.cooldownRemaining = 1000 / this.attackSpeed;
    return this.damage;
  }

  increaseKills(): void {
    this.kills++;
  }

  upgrade(cost: number): void {
    this.level++;
    this.damage += 2.5 * this.level;
    this.radius += 10 * this.level;
    this.totalInvested += cost;
  }

  getSellValue(refundRate: number): number {
    return Math.floor(this.totalInvested * refundRate);
  }
}

export class EnemyModel {
  position: Point;
  speed: number;
  health: number;
  maxHealth: number;
  type: EnemyType;

  private path: Point[] = [];
  private targetIndex = 1;
  reward: number;

  constructor(
    position: Point,
    type: EnemyType,
    speed = 80,
    health = 100,
    reward = 10
  ) {
    this.position = position;
    this.speed = speed;
    this.health = health;
    this.maxHealth = health;
    this.reward = reward;
    this.type = type;
  }

  setPath(points: Point[]) {
    this.path = points ?? [];
    this.targetIndex = this.path.length > 1 ? 1 : 0;
  }

  update(deltaTimeMs: number): boolean {
    if (this.path.length <= 1 || this.targetIndex >= this.path.length) {
      return this.path.length > 0 && this.targetIndex >= this.path.length;
    }

    let remaining = (this.speed * deltaTimeMs) / 1000;

    while (remaining > 0 && this.targetIndex < this.path.length) {
      const target = this.path[this.targetIndex];
      const dx = target.x - this.position.x;
      const dy = target.y - this.position.y;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        this.targetIndex++;
        continue;
      }

      if (dist <= remaining) {
        this.position.x = target.x;
        this.position.y = target.y;
        this.targetIndex++;
        remaining -= dist;
      } else {
        const ratio = remaining / dist;
        this.position.x += dx * ratio;
        this.position.y += dy * ratio;
        remaining = 0;
      }
    }

    return this.targetIndex >= this.path.length;
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    return this.health <= 0;
  }
}

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
