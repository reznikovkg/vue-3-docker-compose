<template>
  <div class="win-screen">
    <div class="content">
      <h1>LEVEL COMPLETED</h1>
      <button class="button" @click="loadScene">NEXT LEVEL</button>
    </div>
  </div>
</template>

<script setup>
import store from "@/store/index.js";

let loadScene = () => {
  store.dispatch("loadScenes")
}
</script>

<style>
.win-screen {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  color: #f2f2f2;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  margin-bottom: 20px;
  z-index: 1000;
}
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 40px;
}
.button {
  border-radius: 50px;
  background-color: greenyellow;
  font-size: 25px;
  color: white;
  padding: 8px 16px 8px 16px;
  text-shadow: 1px 1px 0 green;
}
</style>
