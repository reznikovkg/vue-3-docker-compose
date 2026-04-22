<template>
  <div class="game">
    <GameBoard/>
  </div>
</template>
<script>
import GameBoard from "@/components/ui/GameBoard.vue";

export default {
  name: "GamePage",
  components: {GameBoard}
}
</script>
<style scoped lang="scss">
.game {
  display: flex;
  justify-content: center;
  padding: 20px;
}
</style>