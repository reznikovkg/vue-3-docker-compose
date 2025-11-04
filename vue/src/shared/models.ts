export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class Area {
  constructor(points) {
    this.points = points;
  }

  contains(point) {
    let inside = false;
    for (let i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
      const xi = this.points[i].x, yi = this.points[i].y;
      const xj = this.points[j].x, yj = this.points[j].y;

      const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }
}

export class TowerObj {
  constructor(position, level = 1) {
    this.position = position;
    this.level = level;
    this.damage = 10 * Math.pow(1.15, level - 1);
    this.range = 100 * Math.pow(1.15, level - 1);
    this.target = null;
    this.kills = 0;
    this.attackSpeed = 5; // attacks per second
    this.lastAttackTime = 0;
  }

  canAttack(currentTime) {
    return currentTime - this.lastAttackTime >= 1000 / this.attackSpeed;
  }

  attack(target, currentTime) {
    this.target = target;
    this.lastAttackTime = currentTime;
    return this.damage;
  }

  levelUp() {
    this.level++;
    this.damage = 10 * Math.pow(1.15, this.level - 1);
    this.range = 100 * Math.pow(1.15, this.level - 1);
  }
}

export class Foe {
  constructor(position, speed = 3) {
    this.position = position;
    this.speed = speed;
    this.health = 100;
    this.selected = false;
  }

  move(direction) {
    if (!this.selected) return;

    const moveAmount = this.speed;
    switch (direction) {
      case 'up': this.position.y -= moveAmount; break;
      case 'down': this.position.y += moveAmount; break;
      case 'left': this.position.x -= moveAmount; break;
      case 'right': this.position.x += moveAmount; break;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }
}