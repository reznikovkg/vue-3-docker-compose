<template>
  <main>
    <SpriteText text="Hello World!" :config="pixelSpriteConfig"/>
    <SpriteText text="abcdefghijklmn" :config="pixelSpriteConfig"/>
    <SpriteText text="opqrstuvwxyz" :config="pixelSpriteConfig"/>
    <SpriteText text="1234567890" :config="pixelSpriteConfig"/>
    <SpriteText text=".,!?;-+=…()" :config="pixelSpriteConfig"/>
  </main>
</template>

<script setup>
import SpriteText from './components/SpriteText.vue'
import {pixelSpriteConfig} from './configs/pixelSpriteConfig.js'
</script>

<style scoped lang="less">
.sprite-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}
</style>
