<template>
  <div class="records">
    <div class="records__header">
      <span class="records__title">Рекорды</span>
      <span class="records__badge">{{ size }}×{{ size }}</span>
    </div>

    <div v-if="sizeRecords.length === 0" class="records__empty">
      Нет рекордов для этого размера
    </div>

    <div v-else class="records__list">
      <div
          v-for="(rec, idx) in sizeRecords"
          :key="idx"
          class="records__item"
          :class="{ 'records__item--first': idx === 0 }"
      >
        <span class="records__rank">#{{ idx + 1 }}</span>
        <span class="records__time">{{ formatTime(rec.time) }}</span>
        <span class="records__moves">{{ rec.moves }} ходов</span>
        <span class="records__mode" :class="rec.blockMode ? 'records__mode--block' : 'records__mode--normal'">
          {{ rec.blockMode ? 'блок' : 'обычный' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecordsPanel',
  props: {
    records: { type: Array},
    size: { type: Number,  required: true },
    blockMode: { type: Boolean, default: false },
  },
  computed: {
    sizeRecords() {
      return this.records
          .filter(r => r.size === this.size)
          .sort((a, b) => a.time - b.time)
          .slice(0, 5)
    },
  },
  methods: {
    formatTime(sec) {
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return `${m}:${s.toString().padStart(2, '0')}`
    },
  },
}
</script>

<style scoped lang="scss">
.records {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border: 1px solid #d1d5e8;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(55, 48, 163, 0.06);
  box-sizing: border-box;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  &__title {
    font-family: 'Unbounded', sans-serif;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6b7280;
  }

  &__badge {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: #3730a3;
    background: #ede9fe;
    padding: 3px 8px;
    border-radius: 6px;
  }

  &__empty {
    text-align: center;
    color: #6b7280;
    font-size: 13px;
    font-family: 'Space Mono', monospace;
    padding: 16px 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    background: #f0f2f7;
    border-radius: 10px;
    border: 1px solid #d1d5e8;

    &--first {
      background: #fef3c7;
      border-color: #f59e0b;
    }
  }

  &__rank {
    font-family: 'Space Mono', monospace;
    color: #6b7280;
    font-size: 11px;
    font-weight: 700;
    min-width: 22px;
  }

  &__time {
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    color: #059669;
    font-size: 13px;
    min-width: 44px;
  }

  &__moves {
    font-family: 'Space Mono', monospace;
    color: #4b5563;
    font-size: 12px;
    flex: 1;
  }

  &__mode {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;

    &--normal {
      background: #ede9fe;
      color: #3730a3;
      border: 1px solid #c4b5fd;
    }

    &--block {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fca5a5;
    }
  }
}
</style>