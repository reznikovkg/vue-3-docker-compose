<template>
  <div class="alchemist">
    <!-- Верхняя часть - открытые элементы -->
    <div class="elements">
      <div class="element" v-for="elem in openedElements" :key="elem.id">
        <div class="picture">
          <img :src="elem.picture" class="element-picture"/>
        </div>
        <div class="name">{{ elem.name }}</div>
      </div>
    </div>

    <div class="bottom">
      <!-- Нижняя часть - стол -->
      <div class="table">
        <!-- --------------- -->
      </div>

      <!-- Кнопки -->
      <div class="buttons">
        <button>Смешать</button>
        <button>Сбросить</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlchemistGame',

  data() {
    return {
      // Элементы
      elements: [
        {id: 1, name: 'Огонь', picture: '/src/assets/elements/fire.png', opened: true},
        {id: 2, name: 'Вода', picture: '/src/assets/elements/water.png', opened: true},
        {id: 3, name: 'Земля', picture: '/src/assets/elements/earth.png', opened: true},
        {id: 4, name: 'Воздух', picture: '/src/assets/elements/air.png', opened: true},
        {id: 5, name: 'Пар', picture: '/src/assets/elements/steam.png', opened: false},
        {id: 6, name: 'Лава', picture: '/src/assets/elements/lava.png', opened: false},
        {id: 7, name: 'Грязь', picture: '/src/assets/elements/mud.png', opened: false}
        //энергия
        //туман
        //пыль
        //камень
        //кирпич
        //облако

      ]
    }
  },

  computed: {
    // только открытые элементы
    openedElements() {
      return this.elements.filter(el => el.opened)
    }
  }
}
</script>

<style lang="scss">
.alchemist {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

// Верх — 80% 
.elements {
  flex: 8;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 12px;
  align-content: start;
}

.element {
  aspect-ratio: 1 / 1; // квадратные ячейки
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgb(181, 67, 185);
}

.picture {
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-picture {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.name {
  margin-top: 6px;
  font-size: 14px;
  color: #000;
}

// Низ — 20% 
.bottom {
  flex: 2;
  display: flex;
  border-top: 1px solid #770059;
}

.table {
  flex: 3;
  padding: 10px;
}

.buttons {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 10px;
}

button {
  border-radius: 12px;
  padding: 10px;
  font-size: 16px;
  border: 2px solid rgb(181, 67, 185);
}
</style>