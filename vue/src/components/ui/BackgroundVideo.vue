<template>
  <video 
    class="background-video"
    :src="src"
    autoplay
    loop
    muted
    playsinline
  ></video>
</template>

<script lang="ts">
export default {
  name: 'BackgroundVideo',
  props: {
    src: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
.background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
</style>