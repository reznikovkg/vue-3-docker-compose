<template>
    <div class="slots">
        <div v-for="(slot, index) in slots"
            :key="index"
            class="slots__cell"
            @dragover.prevent
            @drop="event => drop(index, event)"
        >
            <button 
                v-if="slot" 
                class="slots__remove" 
                @click.stop="() => remove(index)"
            >
                ✕
            </button>
            <span v-if="slot">{{ elements[slot]?.icon }}</span>
        </div>
    </div>
</template>

<script>
import { mapGetters,mapActions } from 'vuex'
import { ELEMENTS } from '../../config/elements'

export default{
   computed: {
    ...mapGetters(['slots']),
    elements(){
        return ELEMENTS
    }
  },
  
  methods: {
    ...mapActions(['setSlot']),
    drop(index, event) {
      const id = Number(event.dataTransfer.getData("text/plain"))
      if (id) {
        this.setSlot({ index: index, el: id })
      }
    },
    remove(index) {
      this.setSlot({ index: index, el: null })
    }
  }
}
</script>

<style scoped lang="scss">
.slots {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    width: 100%;
    max-width: 240px;
    margin: 0 auto;

    &__cell {
        position: relative;
        width: 70px;
        height: 70px;
        background: #fff;
        border-radius: 8px;
        border: 2px solid #ccc;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 28px;
        cursor: pointer;
        transition: 0.2s;

        &:hover {
            background: #f0f0f0;
            border-color: #4ecdc4;
        }

        @media (max-width: 600px) {
            width: 60px;
            height: 60px;
            font-size: 24px;
        }
    }

    &__remove {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 18px;
        height: 18px;
        background: #ff6b6b;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: 0.2s;
        z-index: 10;

        &:hover {
            transform: scale(1.1);
        }
    }
}
</style>