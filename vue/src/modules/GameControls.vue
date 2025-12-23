<template>
  <div class="game-controls">
    <button
      :class="{ active: placeMode === 'tower' }"
      @click="$emit('update:placeMode', 'tower')"
    >
      Tower
    </button>
    <div class="game-controls__barricade-group">
      <button
        :class="{ active: placeMode === 'barricade' }"
        @click="$emit('update:placeMode', 'barricade')"
      >
        Barricade
      </button>
      <select
        :value="barricadeType"
        class="game-controls__barricade-select"
        @input="
          $emit(
            'update:barricadeType',
            ($event.target as HTMLSelectElement).value
          )
        "
      >
        <option value="wooden">Wooden ($50, 200HP)</option>
        <option value="stone">Stone ($100, 500HP)</option>
        <option value="metal">Metal ($150, 1000HP)</option>
      </select>
    </div>
    <button
      :class="{ active: placeMode === 'artillery' }"
      @click="$emit('update:placeMode', 'artillery')"
    >
      Artillery
    </button>
    <button @click="$emit('spawnAlly')">Summon an ally</button>
    <span class="game-controls__money">Money: ${{ money }}</span>
  </div>
</template>

<script setup lang="ts">
export interface GameControlsProps {
  placeMode: string;
  barricadeType: string;
  money: number;
}

defineProps<GameControlsProps>();

defineEmits<{
  'update:placeMode': [value: string];
  'update:barricadeType': [value: string];
  'spawnAlly': [];
}>();
</script>

<style lang="scss">
.game-controls {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  align-items: center;
  border-top: 2px solid #2d302fcc;

  button {
    padding: 8px 16px;
    background-color: rgba(0, 0, 20, 0.9);
    color: white;
    border: 1px solid rgba(100, 100, 100, 0.5);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(44, 43, 43, 0.9);
      border-color: rgba(150, 150, 150, 0.7);
    }

    &.active {
      border-color: #08d68acc;
    }
  }

  &__barricade-group {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  &__barricade-select {
    padding: 8px 12px;
    background-color: rgba(0, 0, 20, 0.9);
    color: white;
    border: 1px solid rgba(100, 100, 100, 0.5);
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(70, 70, 70, 0.9);
      border-color: rgba(150, 150, 150, 0.7);
    }

    option {
      background-color: rgba(30, 30, 30, 0.95);
    }
  }

  &__money {
    margin-left: auto;
    color: white;
    font-weight: bold;
    font-size: 16px;
  }
}
</style>
