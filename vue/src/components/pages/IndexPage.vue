<template>
  <div class="c-index-page">
    <!--
    Index

    <div>
      <RouterLink :to="{ name: $routes.EXAMPLE }">
       To Example
      </RouterLink>
    </div>
    -->

    <button type="button" class="c-index-page__button" @click="() => goToExample()">
      Играть
    </button>

    <div class="c-stats">
      <div class="c-stats__row">LIST POWER: {{ listPower }}</div>

      <div class="c-stats__row">
        <button type="button" class="c-stats__btn" @click="() => addEvent(1)">
          +1 event
        </button>

        <button type="button" class="c-stats__btn c-stats__btn--red" @click="() => addEvent(-5)">
          -5 event
        </button>
      </div>

      <div class="c-stats__list">
        <div v-for="(item, index) in list" :key="index" class="c-stats__row">
          {{ item.t }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',

  computed: {
    list() {
      return this.$store.getters['list/getList']
    },

    listPower() {
      return this.$store.getters['list/getListPower']
    }
  },

  methods: {
    goToExample() {
      this.$router.push({ name: this.$routes.EXAMPLE })
    },

    addEvent(delta) {
      const list = this.$store.getters['list/getList']
      const newList = [...list, { t: delta }]
      this.$store.dispatch('list/setList', newList)
    }
  }
}
</script>

<style lang="scss" scoped>
.c-index-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.c-index-page__button {
  width: fit-content;
  padding: 10px 18px;
  cursor: pointer;
}

.c-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
}

.c-stats__row {
  display: flex;
  gap: 8px;
  line-height: 1.4;
}

.c-stats__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.c-stats__btn {
  width: fit-content;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
}

.c-stats__btn--red {
  border-color: #ff4d4f;
  color: #ff4d4f;
}
</style>
