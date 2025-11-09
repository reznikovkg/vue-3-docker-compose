<template>
  <div class="wrapper">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0 80px;
  block-size: 100%;
}
</style>
