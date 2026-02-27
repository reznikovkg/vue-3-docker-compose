<template>
  <div class="bg">
    <button 
      class="corner-button"
      @click="() => clickFishButton()"
    >
      На рыбалку
    </button>
  </div>

  <div 
    class="locations-container"
    v-if="showLocationList"
  >
    <LocationsList @close="() => closeLocationList()"></LocationsList>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import LocationsList from '../LocationsList.vue';

const showLocationList = ref(false)

const clickFishButton = () => {
  showLocationList.value = true
}

const closeLocationList = () => {
  showLocationList.value = false
}

</script>

<style scoped>
.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/images/home_background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.corner-button {
  position: absolute;
  bottom: 30px;
  right: 30px;
  width: 300px;
  height: 200px;
  background: green;
  color: white;
  border: none;
  font-size: 18px;
  cursor: pointer;
  border-radius: 30px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: normal;
}

.locations-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>