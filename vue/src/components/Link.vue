<template>
  <RouterLink v-bind="props" class="link">
    <slot></slot>
  </RouterLink>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

import type { RouterLinkProps } from 'vue-router';

export type LinkProps = RouterLinkProps;

const props = defineProps<LinkProps>();
</script>

<style scoped lang="scss">
.link {
  display: block;
  border: 2px solid transparent;
  border-radius: 5px;
  padding: 3px;
  text-decoration: none;
  transition: border-color 250ms;

  &::after {
    content: '';
    display: block;
    margin-block-start: 2px;
    opacity: 0.6;
    background-color: currentColor;
    transition: transform 0.3s ease;
    transform: scaleX(0);
    transform-origin: left;
    block-size: 3px;
  }

  &:hover::after {
    transform: scaleX(1);
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    border-color: currentColor;
  }
}
</style>
