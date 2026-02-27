<template>
  <div class="alchemist">
    <!-- Верхняя часть - открытые элементы -->
    <div class="elements">
      <div class="element" v-for="elem in openedElements" :key="elem.id" @click="addToTable(elem.id)">
        <div class="picture">
          <img :src="elem.picture" class="element-picture"/>
        </div>
        <div class="name">{{ elem.name }}</div>
      </div>
    </div>

    <div class="bottom">
      <!-- Нижняя часть - стол -->
      <div class="table">
        <div class="table-item" v-for="item in tableElem" :key="item.id">
          <span>{{ getElementName(item.id) }}</span>

          <div class="counter">
            <button @click="changeCount(item.id, -1)">−</button>
            <span class="count">{{ item.count }}</span>
            <button @click="changeCount(item.id, 1)">+</button>
          </div>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="buttons">
        <button @click="mixElements">Смешать</button>
        <button @click="tableElem = []">Сбросить</button>
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
        {id: 7, name: 'Грязь', picture: '/src/assets/elements/mud.png', opened: false},
        {id: 8, name: 'Море', picture: '/src/assets/elements/sea.png', opened: false},
        {id: 9, name: 'Энергия', picture: '/src/assets/elements/energy.png', opened: false},
        {id: 10, name: 'Туман', picture: '/src/assets/elements/fog.png', opened: false},
        {id: 11, name: 'Пыль', picture: '/src/assets/elements/dust.png', opened: false},
        {id: 12, name: 'Камень', picture: '/src/assets/elements/stone.png', opened: false},
        {id: 13, name: 'Кирпич', picture: '/src/assets/elements/brick.png', opened: false},
        {id: 14, name: 'Облако', picture: '/src/assets/elements/cloud.png', opened: false},
      ],
      recipes: {
        '1+2': 5,  
        '1+3': 6,  
        '2+3': 7,   
        '2+2': 8,   
        '1+4': 9,   
        '2+4': 10,  
        '3+4': 11,  
        '3+3': 12,  
        '1+12': 13, 
        '2+10': 14  
      },
      tableElem:[]
    }
  },

  computed: {
    openedElements() {
      return this.elements.filter(elem => elem.opened)
    }
  },
  methods: {
    addToTable (id) {
      const item = this.tableElem.find(i => i.id === id)

      if (item) {
        item.count++
      } else {
        this.tableElem.push({ id, count: 1 })
      }
    },

    changeCount (id, value) {
      const item = this.tableElem.find(i => i.id === id)
      if (!item) return

      item.count += value

      if (item.count <= 0) {
        this.tableElem = this.tableElem.filter(i => i.id !== id)
      }
    },
    
    getElementName(id) {
      const element = this.elements.find(e => e.id === id)
      return element.name 
    },

    mixElements() {
      if (this.tableElem.length === 0) {
        alert('Добавьте элементы на стол')
        return
      }

      const ingredients = []

      this.tableElem.forEach(item => {
        for (let i = 0; i < item.count; i++) { 
          ingredients.push(item.id)
        }
      })
      ingredients.sort((a, b) => a - b)

      const key = ingredients.join('+')

      const resultId = this.recipes[key]

      if (resultId) {
        const element = this.elements.find(e => e.id === resultId)
        if (!element.opened) {
          element.opened = true
          alert(`Вы открыли новый элемент: ${element.name}`)
        }
        this.tableElem = []
        this.addToTable(resultId)
      } 
      else {alert('Ничего не получилось')}
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
  cursor: pointer;
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
.table-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.counter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.counter button {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 2px solid #b543b9;
  background: white;
  font-size: 18px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;
}

.count {
  min-width: 20px;
  text-align: center;
  font-weight: bold;
}

button {
  border-radius: 12px;
  padding: 10px;
  font-size: 16px;
  border: 2px solid rgb(181, 67, 185);
  cursor: pointer;
}

.buttons button {
  transition: all 0.2s ease;
}

.buttons button:hover {
  background-color: #b543b9;
  color: white;
  transform: scale(1.05);
}
</style>