<template>
  <div class = "app"> 
    <main class = "app__main"> 
      <router-view /> 
    </main> 
  </div> 
</template>

<script>
export default { 
  name: 'App', 
}
</script>

<style scoped lang="scss">
.app { 
  width: 100%; 
  min-height: 100vh; 
  background: #1a1a2e; 
  color: #ffffff; 
  font-family: Arial, sans-serif; 
  margin: 0; 
  padding: 0; 
 
  &__main { 
    width: 100%; 
    min-height: 100vh; 
    display: flex; 
    flex-direction: column; 
    align-items: center;
  } 
} 
</style>
