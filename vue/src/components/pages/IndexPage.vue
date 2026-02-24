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

    <RouterLink :to="{ name: $routes.EXAMPLE }" class="c-index-page__link">
      <button type="button" class="c-index-page__button">Играть</button>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.c-index-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.c-index-page__button {
  padding: 10px 18px;
  cursor: pointer;
}

.c-index-page__link {
  text-decoration: none;
}
</style>
