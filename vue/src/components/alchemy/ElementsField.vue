<template>
  <div class="field">
    <ElementCard
      v-for="el in elements"
      :key="el"
      :name="el"
      @click="() => add(el)"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ElementCard from './ElementCard.vue'

export default {
  name: 'ElementsField',
  components: { ElementCard },
  computed: {
    ...mapGetters(['discoveredElements']),
    elements() { return this.discoveredElements }
  },
  methods: {
    ...mapActions(['addToTable']),
    add(el) { this.addToTable(el) }
  }
}
</script>

<style scoped lang="scss">
.field {
  flex: 8;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  padding: 20px;
  overflow-y: auto;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  align-content: flex-start;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.2);
    border-radius: 4px;

    &:hover {
      background: rgba(0,0,0,0.3);
    }
  }
}
</style>