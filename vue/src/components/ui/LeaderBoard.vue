<template>
  <div class="leader-board">
    <div class="leader-board__header">Лучшие игры</div>
    <div class="leader-board__body">
      <div class="leader-board__list">
        <p class="leader-board__field leader-board__field--short">Имя</p>
        <p class="leader-board__field leader-board__field--short">Рейтинг</p>
        <p class="leader-board__field leader-board__field--short">Время</p>
        <p class="leader-board__field leader-board__field--long">Кол-во цветов</p>
        <p class="leader-board__field leader-board__field--long">Сложный режим</p>
      </div>
      <div v-for="line in getTop" class="leader-board__list">
        <p class="leader-board__field">{{line.name}}</p>
        <p class="leader-board__field">{{line.score.toFixed(4)}}</p>
        <p class="leader-board__field">{{line.time}}</p>
        <p class="leader-board__field">{{line.qty_colors}}</p>
        <p class="leader-board__field">{{line.is_hard_mode ? "+" : "-"}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'LeaderBoard',
  data() {
    return {
      unsubscribe: null,
    }
  },
  computed: {
    ...mapGetters([
      'getTop',
    ]),
  },
  mounted() {
    this.subscribeTop()
  },
  beforeUnmount() {
    this.unsubscribeTop()
  },
  methods: {
    ...mapActions([
      'subscribeTop',
      'unsubscribeTop'
    ])
  }
}
</script>

<style scoped lang="scss">
.leader-board {
  display: grid;
  grid-template-rows: auto 1fr;
  justify-items: center;
  gap: 1vw;
  padding: 2vh;
  width: 15vw;
  height: 70vh;
  background-color: #fffaee;
  border-radius: 30px;
  border: 3px solid #194d6c;
  box-shadow: 0 9px 18px 0 #194d6c;
  position: relative;

  &__header {
    color: #194d6c;
    font-size: max(1.3vw, 20px);
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
  }

  &__body {
    overflow-y: auto;
    max-height: 100%;
  }

  &__list {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
    justify-items: center;
    align-items: center;
    color: #194d6c;
  }

  &__field {
    text-align: center;
    white-space: nowrap;
    overflow-x: auto;
    max-width: 100%;

    &::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: 1800px) {
      font-size: 17px;
    }

    @media (min-width: 1600px) and (max-width: 1800px) {
      font-size: 15px;
    }

    @media (min-width: 1300px) and (max-width: 1600px) {
      font-size: 16px;
    }

    @media (min-width: 1000px) and (max-width: 1300px) {
      font-size: 14px;
    }

    @media (min-width: 800px) and (max-width: 1000px) {
      font-size: 13px;
    }

    @media (min-width: 550px) and (max-width: 800px) {
      font-size: 20px;
    }

    @media (max-width: 550px)  {
      font-size: 15px;
    }

    &--short {
      @media (min-width: 1600px) and (max-width: 1800px) {
        font-size: 14px;
      }
    }

    &--long {
      @media (min-width: 1800px) {
        font-size: 16px;
      }

      @media (min-width: 1600px) and (max-width: 1800px) {
        font-size: 12px;
      }

      @media (min-width: 1300px) and (max-width: 1600px) {
        font-size: 14px;
      }

      @media (min-width: 800px) and (max-width: 1300px) {
        font-size: 12px;
      }

      @media (max-width: 550px)  {
        font-size: 13px;
      }
    }
  }

  @media (min-width: 1600px) {
    width: 23vw;
  }

  @media (min-width: 1300px) and (max-width: 1600px) {
    width: 30vw;
  }

  @media (min-width: 1000px) and (max-width: 1300px) {
    width: 35vw;
  }

  @media (min-width: 800px) and (max-width: 1000px) {
    width: 40vw;
  }

  @media (min-width: 550px) and (max-width: 800px) {
    width: 90vw;
    height: 90vh;
  }

  @media (max-width: 550px)  {
    width: 90vw;
    height: 90vh;
  }
}
</style>