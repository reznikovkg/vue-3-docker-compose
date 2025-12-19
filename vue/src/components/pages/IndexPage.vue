<template>
  <div class="index-page">
    <h1>Главная страница</h1>
    <nav>
      <RouterLink :to="{ name: $routes.BUBBLE_GAME }">Игра "Мыльные пузыри" 🫧</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.index-page {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

nav a {
  padding: 20px 30px;
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  transition: all 0.3s;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

nav a:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(78, 205, 196, 0.4);
}
</style>
