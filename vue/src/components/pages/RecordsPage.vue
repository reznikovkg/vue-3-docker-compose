<template>
  <div class="records-page">
    <div class="records-page__header">
      <h2 class="records-page__title">Рекорды</h2>
      <div class="records-page__line"/>
    </div>

    <div class="records-page__content">
      <div
          v-for="(record, key) in records"
          :key="key"
          class="records-page__record-item"
      >
        <div class="records-page__record-type">
          {{ formatRecordType(key) }}
        </div>
        <div class="records-page__record-time">
          {{ formatTime(record) }}
        </div>
      </div>

      <div
          v-if="Object.keys(records).length === 0"
          class="records-page__empty"
      >
        Нет сохраненных рекордов
      </div>
    </div>

    <div class="records-page__button-wrapper">
      <CustomButton @click="() => goBack()">
        Назад
      </CustomButton>
    </div>
  </div>
</template>

<script>
import CustomButton from "@/components/ui/CustomButton.vue"
import {mapGetters} from 'vuex'
import {ROUTES} from "@/router/index.js"

export default {
  name: 'RecordsPage',
  components: {
    CustomButton
  },
  computed: {
    ...mapGetters({
      records: 'getRecords'
    })
  },
  methods: {
    formatRecordType(key) {
      const [mode, size] = key.split('_')
      const modeText = mode === 'blocked' ? 'Сложный режим' : 'Стандартный режим'
      return `${modeText} (${size})`
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    goBack() {
      this.$router.push({name: ROUTES.INDEX})
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/styles";

.records-page {
  &__header {
    text-align: center;
  }

  &__title {
    text-align: center;
    color: $purpleDark;
    font-size: 70px;
    font-weight: 700;

    @media (max-width: 480px) {
      font-size: 40px;
    }
  }

  &__line {
    @include gradientLine;
    height: 3px;
    width: 80%;
    max-width: 1000px;
    margin: 0 auto;
  }

  &__content {
    @include containerPadding;
    width: 100%;
    max-width: 950px;
    margin: 40px auto;
    word-wrap: break-word;
  }

  &__record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    margin-bottom: 10px;
    background: $purpleBg;
    border-radius: 30px;
    border: 2px solid $purpleBorder;
  }

  &__record-type {
    font-size: 24px;
    color: $purpleDark;
    font-weight: 600;

    @media (max-width: 480px) {
      font-size: 18px;
    }
  }

  &__record-time {
    font-size: 24px;
    color: $purpleDarker;
    font-weight: 700;

    @media (max-width: 480px) {
      font-size: 18px;
    }
  }

  &__empty {
    text-align: center;
    font-size: 30px;
    color: $purpleDarker;
    padding: 40px;
  }

  &__button-wrapper {
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
  }
}
</style>
