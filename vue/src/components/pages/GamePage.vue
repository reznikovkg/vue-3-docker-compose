<template>
  <Stopwatch class="stopwatch"></Stopwatch>
  <div class="main">
    <Game/>
    <LeaderBoard></LeaderBoard>
  </div>
</template>

<script>
import Game from '@/components/ui/Game.vue'
import Stopwatch from '@/components/ui/Stopwatch.vue'
import LeaderBoard from '@/components/ui/LeaderBoard.vue'

export default {
  name: 'GamePage',
  components: {LeaderBoard, Stopwatch, Game}
}
</script>

<style scoped lang="scss">
.stopwatch {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 5vh;
}

.main {
  display: grid;

  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
    gap: 3vw;
  }

  @media (max-width: 800px) {
    grid-template-rows: 1fr 1fr;
    gap: 12vh;
  }
}

</style>