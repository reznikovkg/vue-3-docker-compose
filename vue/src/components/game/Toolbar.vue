<template>
  <div class="toolbar">
    <div class="toolbar__modes">
      <button
          class="toolbar__button"
          :class="{ 'toolbar__button--active': mode === 'build' }"
          @click="setMode('build')"
      >
        Build
      </button>

      <button
          class="toolbar__button toolbar__button--danger"
          :class="{ 'toolbar__button--active': mode === 'delete' }"
          @click="setMode('delete')"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useStore} from 'vuex'

const store = useStore()

const mode = computed(() => store.state.grid.mode)

const setMode = mode => store.commit('SET_MODE', mode)
</script>

<style lang="less" scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__shapes {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__modes {
    display: flex;
    gap: 10px;
  }

  &__button {
    padding: 12px 18px;
    font-size: 16px;
    border-radius: 12px;
    border: none;

    background: #f0f0f0;
    color: #333;

    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #e6f7ff;
    }

    &:active {
      transform: scale(0.95);
    }

    &--active {
      background: #1677ff;
      color: #fff;
    }

    &--big {
      padding: 16px 24px;
      font-size: 18px;
      border-radius: 14px;
    }

    &--primary {
      background: #1677ff;
      color: #fff;

      &:hover {
        background: #4096ff;
      }
    }

    &--danger {
      background: #ff4d4f;
      color: #fff;

      &:hover {
        background: #ff7875;
      }
    }

    &--success {
      background: #52c41a;
      color: #fff;

      &:hover {
        background: #73d13d;
      }
    }
  }
}
</style>