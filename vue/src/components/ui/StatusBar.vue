<template>
  <div class = "status-bar">
    <div class = "status-bar__item">
      HP: {{ stats.hp }} / {{ stats.maxHp }}
    </div>

    <div class = "status-bar__item">
      Mana: {{ stats.mana }} / {{ stats.maxMana }}
    </div>

    <div class = "status-bar__item">
      Coins: {{ stats.coins }}
    </div>

    <div class = "status-bar__item">
      Damage: {{ stats.damage }}
    </div>

    <div class = "status-bar__item">
      Time: {{ stats.time }}
    </div>

    <div class = "status-bar__hint">
      Esc — pause, Q — area hit, E — death shot
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusBar',

  props: {
    stats: {
      type: Object,
      default() {
        return {}
      }
    }
  }
}
</script>

<style scoped lang="scss">
.status-bar {
  position: absolute;
  left: 16px;
  top: 16px;
  z-index: 10;

  display: grid;
  gap: 6px;

  color: #ffffff;
  font-size: 16px;

  &__hint {
    font-size: 12px;
    color: #cccccc;
  }
}
</style>