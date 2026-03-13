<template>
    <div
      v-if="isOpen"
      class="modal"
      @click="() => close()"
    >
        <div
          class="modal__content"
          @click.stop
        >
            <div class="modal__head">
                <h3>Рекорды</h3>

                <button
                  class="modal__close"
                  @click="() => close()"
                >
                    Закрыть
                </button>
            </div>

            <div
              v-if="!records.length"
              class="modal__empty"
            >
                Пока нет записей
            </div>

            <div
              v-else
              class="modal__grid"
            >
                <div
                  v-for="(record, index) in records"
                  :key="index"
                  class="modal__record"
                >
                    <span class="modal__place">
                        {{ index + 1 }}.
                    </span>

                    <span class="modal__time">
                        {{ formatTime(record) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'RecordsModal',

    props: {
        isOpen: { type: Boolean, required: true },
        records: { type: Array, required: true }
    },

    emits: ['close'],

    methods: {
        close () {
            this.$emit('close')
        },

        formatTime (time) {
            const minutes = Math.floor(time / 60)
            const seconds = time % 60

            const m = minutes < 10 ? '0' + minutes : minutes
            const s = seconds < 10 ? '0' + seconds : seconds

            return m + ':' + s
        }
    }
}
</script>

<style scoped lang="scss">
.modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    justify-content: center;
    align-items: center;

    &__content {
        background: #1f1f1f;
        color: white;
        padding: 20px;
        min-width: 320px;
    }

    &__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    &__close {
        padding: 6px 12px;
        cursor: pointer;
    }

    &__empty {
        margin-top: 10px;
    }

    &__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 20px;
        width: 240px;
        margin: 10px auto 0;
    }

    &__record {
        display: flex;
        justify-content: space-between;
        border: 1px solid #555;
        padding: 6px 10px;
    }

    &__place {
        font-weight: bold;
    }

    &__time {
        color: #7CFC00;
    }
}
</style>