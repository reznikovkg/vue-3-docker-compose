<template>
  <div class = "game__records-container">
    <div v-if = "records.easy.length > 0" class="game__records">
      <h2 class = "game__records-title">Топ 10 лучших результатов в лёгком режиме</h2>
      <ol class= "game__records-list">
        <li v-for = "(time, idx) in records.easy" :key="idx">
          {{ formatRecord(time) }}
        </li>
      </ol>
    </div>

    <div v-if = "records.hard.length > 0" class="game__records">
      <h2 class = "game__records-title">Топ 10 лучших результатов в сложном режиме</h2>
      <ol class = "game__records-list">
        <li v-for = "(time, idx) in records.hard" :key="idx">
          {{ formatRecord(time) }}
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameRecords',
  props: {
    records: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatRecord(seconds) {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }
  }
}
</script>

<style scoped lang="scss">
.game__records-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game__records {
  background: #f5f5f5;
  padding: 20px 40px;
  border-radius: 12px;
  text-align: center;
}

.game__records-title {
  margin-bottom: 15px;
  font-size: 20px;
  color: #444;
}

.game__records-list {
  list-style-type: decimal;
  text-align: left;
  padding-left: 20px;
  margin: 0;

  li {
    font-size: 18px;
    margin-bottom: 8px;
    color: #555;
  }
}
</style>