<template>
  <div class="select-dropdown">
    <div class="select-dropdown__current" @click="() => toggleDropdown()">
      <span>{{ currentLabel }}</span>
      <span class="select-dropdown__current__arrow">{{ isOpen ? '▲' : '▼' }}</span>
    </div>
    
    <div v-if="isOpen" class="select-dropdown__dropdown">
      <div 
        v-for="option in options" 
        :key="option.value"
        class="select-dropdown__dropdown__option"
        :class="{ active: option.value === modelValue }"
        @click="() => selectOption(option.value)"
      >
        <slot name="option" :option="option">
          <span>{{ option.label }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import soundManager from './../../utils/soundManager';

export default {
  name: 'SelectDropdown',
  props: {
    modelValue: {
      type: [String, Number],
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    getLabel: {
      type: Function,
      default: (option: any) => option.label || option.name || option.value
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    currentLabel() {
      const selected = this.options.find(opt => opt.value === this.modelValue)
      return selected ? this.getLabel(selected) : this.modelValue
    }
  },
  methods: {
    toggleDropdown() {
      soundManager.play('click')
      this.isOpen = !this.isOpen
    },
    selectOption(value: any) {
      soundManager.play('click')
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
      this.isOpen = false
    },
    closeOnClickOutside(e: MouseEvent) {
      if (!this.$el.contains(e.target as Node)) {
        this.isOpen = false
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.closeOnClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeOnClickOutside)
  }
}
</script>

<style scoped lang="scss">
.select-dropdown {
  position: relative;
  
  &__current {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    background: #3a3f44;
    border: 2px solid #3a3f44;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #4a4f54;
    }

    span {
      color: #ededf0;
    }

    &__arrow {
      color: #b0b0b0;
      font-size: 12px;
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 5px;
    background: #3a3f44;
    border: 2px solid #4a4f54;
    border-radius: 6px;
    z-index: 10;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    &__option {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #ededf0;

      &:hover {
        background: #4a4f54;
      }

      &.active {
        background: #00d389;
        
        span {
          color: white;
          font-weight: 600;
        }
      }
    }
  }
}
</style>