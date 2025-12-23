import { EnemyType, ShooterEnemyType, AllyType, BarricadeType } from './types';

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
  health: number;
  maxHealth: number;

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
    this.health = 200 * level;
    this.maxHealth = 200 * level;
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
    this.maxHealth = 200 * this.level;
    this.health = this.maxHealth;
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    return this.health <= 0;
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

export class ShooterEnemyModel extends EnemyModel {
  shootRadius: number;
  shootDamage: number;
  shootSpeed: number;
  shootCooldown: number;
  shootTarget: Point | null;
  shooterType: ShooterEnemyType;

  constructor(
    position: Point,
    shooterType: ShooterEnemyType,
    speed = 60,
    health = 150,
    reward = 20
  ) {
    super(position, 'medium', speed, health, reward);
    this.shooterType = shooterType;

    switch (shooterType) {
      case 'shooter_light':
        this.shootRadius = 80;
        this.shootDamage = 5;
        this.shootSpeed = 2;
        break;
      case 'shooter_medium':
        this.shootRadius = 100;
        this.shootDamage = 10;
        this.shootSpeed = 1.5;
        break;
      case 'shooter_heavy':
        this.shootRadius = 120;
        this.shootDamage = 20;
        this.shootSpeed = 1;
        break;
    }

    this.shootCooldown = 0;
    this.shootTarget = null;
  }

  updateShooting(deltaTime: number): void {
    this.shootCooldown -= deltaTime;
  }

  canShoot(): boolean {
    return this.shootCooldown <= 0;
  }

  shoot(target: Point): number {
    this.shootTarget = target;
    this.shootCooldown = 1000 / this.shootSpeed;
    return this.shootDamage;
  }
}

export class AllyModel {
  position: Point;
  speed: number;
  health: number;
  maxHealth: number;
  damage: number;
  attackRadius: number;
  attackSpeed: number;
  attackCooldown: number;
  target: Point | null;
  allyType: AllyType;

  private path: Point[] = [];
  private targetIndex = 1;

  constructor(position: Point, allyType: AllyType) {
    this.position = position;
    this.allyType = allyType;

    switch (allyType) {
      case 'soldier':
        this.speed = 70;
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 15;
        this.attackRadius = 70;
        this.attackSpeed = 2;
        break;
      case 'heavy_soldier':
        this.speed = 50;
        this.health = 250;
        this.maxHealth = 90;
        this.damage = 30;
        this.attackRadius = 75;
        this.attackSpeed = 1;
        break;
    }

    this.attackCooldown = 0;
    this.target = null;
  }

  setPath(points: Point[]) {
    this.path = points ?? [];
    this.targetIndex = this.path.length > 1 ? 1 : 0;
  }

  update(deltaTimeMs: number): boolean {
    this.attackCooldown -= deltaTimeMs;

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

  canAttack(): boolean {
    return this.attackCooldown <= 0;
  }

  attack(target: Point): number {
    this.target = target;
    this.attackCooldown = 1000 / this.attackSpeed;
    return this.damage;
  }

  updateAttackCooldown(deltaTime: number): void {
    this.attackCooldown -= deltaTime;
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    return this.health <= 0;
  }
}

export class BarricadeModel {
  position: Point;
  startPoint: Point;
  endPoint: Point;
  health: number;
  maxHealth: number;
  barricadeType: BarricadeType;
  size: number;
  width: number;
  angle: number;

  constructor(
    startPoint: Point,
    endPoint: Point,
    barricadeType: BarricadeType
  ) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.barricadeType = barricadeType;
    this.size = 15;

    this.position = new Point(
      (startPoint.x + endPoint.x) / 2,
      (startPoint.y + endPoint.y) / 2
    );

    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    this.width = Math.hypot(dx, dy);
    this.angle = Math.atan2(dy, dx);

    switch (barricadeType) {
      case 'wooden':
        this.health = 200;
        this.maxHealth = 200;
        break;
      case 'stone':
        this.health = 500;
        this.maxHealth = 500;
        break;
      case 'metal':
        this.health = 1000;
        this.maxHealth = 1000;
        break;
    }
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    return this.health <= 0;
  }

  intersects(point: Point, radius: number = 15): boolean {
    const dx = this.endPoint.x - this.startPoint.x;
    const dy = this.endPoint.y - this.startPoint.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) return false;

    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - this.startPoint.x) * dx +
          (point.y - this.startPoint.y) * dy) /
          (length * length)
      )
    );

    const closestX = this.startPoint.x + t * dx;
    const closestY = this.startPoint.y + t * dy;

    const distance = Math.hypot(point.x - closestX, point.y - closestY);

    return distance <= this.size / 2 + radius;
  }
}

export class ArtilleryStrikeModel {
  position: Point;
  maxDamage: number;
  maxRadius: number;
  duration: number;
  elapsed: number;

  constructor(position: Point, maxDamage = 100, maxRadius = 80) {
    this.position = position;
    this.maxDamage = maxDamage;
    this.maxRadius = maxRadius;
    this.duration = 1000;
    this.elapsed = 0;
  }

  update(deltaTime: number): boolean {
    this.elapsed += deltaTime;
    return this.elapsed >= this.duration;
  }

  calculateDamage(targetPosition: Point): number {
    const dx = targetPosition.x - this.position.x;
    const dy = targetPosition.y - this.position.y;
    const distance = Math.hypot(dx, dy);

    if (distance > this.maxRadius) return 0;

    const damageRatio = 1 - distance / this.maxRadius;
    return this.maxDamage * damageRatio;
  }

  isComplete(): boolean {
    return this.elapsed >= this.duration;
  }
}
