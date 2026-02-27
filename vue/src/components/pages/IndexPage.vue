<template>
  <div>
    <FieldTable class="game-field"/>
    <div class="start-size-menu">
      <button class="start-button">Start</button>
      <input class="field-size-input" v-model="fieldSize" type="number">
      <div>
        Размер: {{updateSize}}
      </div>
    </div>
  </div>
</template>

<script>
import FieldTable from '@/components/Field/FieldTable.vue';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'IndexPage',
  components: {
    FieldTable
  },
  data () {
    return {
      fieldSize: 7
    }
  },
  computed: {
    ...mapGetters('field', ['getFieldSize']),
    updateSize() {
      if (this.fieldSize < this.getFieldSize){
        this.fieldSize--
      }
      this.changeFieldSize(this.fieldSize);
      this.fieldSize = this.getFieldSize
      return this.fieldSize;
    }
  },
  methods: {
    ...mapActions('field', [
      'changeFieldSize'
    ])
  }
}
</script>

<style scoped>
.field-size-input {
  width: 11vmin;
  height: 4vmin;
  font-size: 3vmin;
}
.start-size-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3vmin;
  gap: 1vmin;
}
.start-button{
  width: 11vmin;
  height: 4vmin;
  font-size: 3vmin;
}
.game-field {
  background-color:white;
}
</style>
