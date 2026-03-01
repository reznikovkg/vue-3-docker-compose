<template>
  <div class="alchemist">

    <ElementsGrid
      :openedElements="openedElements"
      @add="addToTable"
    />

    <AlchemistTable
      :tableElem="tableElem"
      :getElementName="getElementName"
      @change="changeCount"
      @mix="mixElements"
      @reset="tableElem = []"
    />

  </div>
</template>

<script>
import ElementsGrid from "@/components/pages/Elements.vue"
import AlchemistTable from "@/components/pages/Table.vue"

export default {
  name: 'AlchemistGame',

  components: {
    ElementsGrid,
    AlchemistTable
  },

  data() {
    return {
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
      tableElem: []
    }
  },

  computed: {
    openedElements() {
      return this.elements.filter(elem => elem.opened)
    }
  },

  methods: {
    addToTable(id) {
      const item = this.tableElem.find(i => i.id === id)

      if (item) {
        item.count++
      } else {
        this.tableElem.push({ id, count: 1 })
      }
    },

    changeCount(id, value) {
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
      } else {
        alert('Ничего не получилось')
      }
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
</style>