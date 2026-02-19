<template>
<div class ="app">
    <main class="app__main">
      <GameGrid />
    </main>
</div>
</template>

<script setup>
import GameGrid from './components/GameGrid.vue';
</script>

<style>
* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

html {
width: 100vw;
height: 100vh;
overflow-x: hidden;
}

body {
width: 100vw;
height: 100vh;
margin: 0;
padding: 0;
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
overflow-x: hidden;
}

#app {
width: 100vw;
height: 100vh;
display: flex;
justify-content: center;
align-items: center;
padding: 0;
margin: 0;
}

.app {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
width: 100%;
}

.app__main {
width: 100%;
display: flex;
justify-content: center;
max-width: 700px;
}
</style>