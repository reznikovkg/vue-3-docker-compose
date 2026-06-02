<template>
  <div class = "upgrade-overlay">
    <h3 class = "upgrade-overlay__title">
      Upgrades
    </h3>

    <div class = "upgrade-overlay__coins">
      Coins: {{ stats.coins }}
    </div>

    <BaseButton @click = "() => heal()">
      Heal +30 — {{ prices.heal }}
    </BaseButton>

    <BaseButton @click = "() => damage()">
      Damage +5 — {{ prices.damage }}
    </BaseButton>

    <BaseButton @click = "() => mana()">
      Mana +40 — {{ prices.mana }}
    </BaseButton>

    <BaseButton @click = "() => maxHp()">
      Max HP +20 — {{ prices.maxHp }}
    </BaseButton>

    <BaseButton @click = "() => maxMana()">
      Max Mana +20 — {{ prices.maxMana }}
    </BaseButton>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'

export default {
  name: 'UpgradeOverlay',

  components: {
    BaseButton
  },

  props: {
    stats: {
      type: Object,
      default() {
        return {}
      }
    },

    prices: {
      type: Object,
      default() {
        return {}
      }
    }
  },

  emits: ['heal', 'damage', 'mana', 'max-hp', 'max-mana'],

  methods: {
    heal() {
      this.$emit('heal')
    },

    damage() {
      this.$emit('damage')
    },

    mana() {
      this.$emit('mana')
    },

    maxHp() {
      this.$emit('max-hp')
    },

    maxMana() {
      this.$emit('max-mana')
    }
  }
}
</script>

<style scoped lang="scss">
.upgrade-overlay {
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 30;

  display: grid;
  gap: 8px;

  width: 240px;
  padding: 16px;

  background: #ffffff;
  color: #000000;

  &__title {
    font-size: 20px;
  }

  &__coins {
    font-size: 16px;
  }
}
</style>