<template>
  <div class="records">
    <p class="records__title">Рекорды</p>

    <div v-if="topRecords.length === 0" class="records__empty">
      Пока нет завершённых игр
    </div>

    <div v-else class="records__list">
      <div class="records__row records__row--head">
        <span>#</span>
        <span>Время</span>
        <span>Колбы</span>
        <span>Цвета</span>
        <span>Слои</span>
        <span>Сложн.</span>
      </div>

      <div
        v-for="(record, index) in topRecords"
        :key="record.createdAt + index"
        class="records__row"
      >
        <span>{{ index + 1 }}</span>
        <span>{{ formatTime(record.time) }}</span>
        <span>{{ record.qtyFlasks }}</span>
        <span>{{ record.qtyColors }}</span>
        <span>{{ record.maxQtyLayers }}</span>
        <span>{{ record.hardMode ? 'Да' : 'Нет' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Records',
  computed: {
    ...mapGetters([
      'getTopRecords'
    ]),
    topRecords() {
      return this.getTopRecords
    }
  },
  mounted() {
    this.loadRecords()
  },
  methods: {
    ...mapActions([
      'loadRecords'
    ]),
    formatTime(time) {
      const minutes = Math.floor(time / 60)
      const seconds = time % 60

      if (minutes > 0) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }

      return `${seconds.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped lang="scss">
.records {
  width: min(100%, 760px);
  padding: 22px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(10px);
  box-shadow:
    0 18px 40px rgba(41, 65, 85, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);

  &__title {
    font-size: 30px;
    font-weight: 800;
    text-align: center;
    color: #1f3140;
    margin-bottom: 16px;
  }

  &__empty {
    color: #5d7281;
    font-size: 18px;
    text-align: center;
    padding: 10px 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__row {
    display: grid;
    grid-template-columns: 0.6fr 1.2fr 1fr 1fr 1fr 1fr;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    border-radius: 16px;
    background: rgba(244, 248, 251, 0.8);
    color: #243746;
    font-size: 16px;
    font-weight: 600;
    text-align: center;

    &--head {
      background: rgba(224, 234, 241, 0.95);
      font-weight: 800;
    }
  }

  @media (max-width: 900px) {
    &__row {
      grid-template-columns: repeat(6, minmax(52px, 1fr));
      font-size: 13px;
      padding: 10px 8px;
    }
  }
}
</style>