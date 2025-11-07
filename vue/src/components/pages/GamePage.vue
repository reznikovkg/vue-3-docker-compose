<template>
  <div class="game-page">
    <header class="game-page-header">
      <div class="game-page-header__content">
        <h1 class="game-page-header__title">Три в ряд</h1>
        <p class="game-page-header__subtitle">Прототип по мотивам "Сокровищ Монтесумы"</p>
      </div>
    </header>
    <div class="game-page__container">
      <GameBoard />
    </div>
  </div>
</template>

<script setup lang="ts">
import GameBoard from "@/components/parts/game/GameBoard.vue"
</script>
