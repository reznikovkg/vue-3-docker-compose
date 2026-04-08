<template>
  <div class="toolbar" >
    <div class="toolbar__modes">
      <button
          class="toolbar__button toolbar__button--build"
          :class="{ 'toolbar__button--active': mode === 'build' }"
          @click="setMode('build')"
      >
        Build
      </button>

      <button
          class="toolbar__button toolbar__button--delete"
          :class="{ 'toolbar__button--active': mode === 'delete' }"
          @click="setMode('delete')"
      >
        Delete
      </button>

    </div>

    <div class="toolbar__grid-size"  :class="{ 'is-disabled': mode === 'delete' }">
      <label>
        Width:
        <input
            type="number"
            v-model.number="localWidth"
            @change="applyResize"
            min="8"
            max="20"
        />
      </label>

      <label>
        Height:
        <input
            type="number"
            v-model.number="localHeight"
            @change="applyResize"
            min="8"
            max="20"
        />
      </label>
    </div>
  </div>

  <ShapeList :class="{ 'is-disabled': mode === 'delete' }"/>
</template>

<script setup>
import {computed, ref, watch} from 'vue'
import {useStore} from 'vuex'
import ShapeList from "@/components/game/ShapeList.vue";
import {MUTATIONS} from "@/store/index.js";

const store = useStore()

const mode = computed(() => store.state.grid.mode)

const setMode = mode => store.commit(MUTATIONS.SET_MODE, mode)

const localWidth = ref(store.state.grid.width)
const localHeight = ref(store.state.grid.height)

watch(() => store.state.grid.width, v => localWidth.value = v)
watch(() => store.state.grid.height, v => localHeight.value = v)

const applyResize = async () => {
  const res = await store.dispatch('resizeGrid', {
    width: localWidth.value,
    height: localHeight.value
  })

  if (!res.ok) {
    alert(res.message)

    localWidth.value = store.state.grid.width
    localHeight.value = store.state.grid.height
  }
}
</script>

<style lang="less" scoped>
.is-disabled {
  opacity: 0.4;
  pointer-events: none;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;

  label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    color: #000;
  }

  input {
    width: 70px;
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

    color: #000;
    cursor: pointer;

    opacity: 0.6;
    transition: 0.2s;

    &:hover {
      opacity: 0.8;
    }

    &:active {
      transform: scale(0.96);
    }

    &--active {
      opacity: 1;
    }

    &--build {
      background: #1677ff;
    }

    &--delete {
      background: #ff4d4f;
    }
  }
}
</style>
