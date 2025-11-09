import { MOVEMENT_KEY_OFFSETS } from './constants';
import { Arrows } from './types';

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

  constructor(position: Point, level = 1) {
    this.position = position;
    this.level = level;
    this.damage = 10 * level;
    this.radius = 100 * level;
    this.target = null;
    this.kills = 0;
    this.attackSpeed = 5;
    this.cooldownRemaining = 0;
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

    if (this.kills % 3 === 0) {
      this.level++;
      this.damage = 10 * this.level;
      this.radius = 100 * this.level;
    }
  }
}

export class EnemyModel {
  position: Point;
  speed: number;
  health: number;
  selected: boolean;

  constructor(position: Point, speed = 3) {
    this.position = position;
    this.speed = speed;
    this.health = 100;
    this.selected = false;
  }

  move(key: Arrows): void {
    if (!this.selected) return;

    const offset = MOVEMENT_KEY_OFFSETS[key];
    this.position.x += offset.dx * this.speed;
    this.position.y += offset.dy * this.speed;
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
