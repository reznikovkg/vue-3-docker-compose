<template>
  <Modal :is-open="gameResult">
    <div class="modal-content">
      <h2>{{ gameResult === 'win' ? 'Win' : 'You lost' }}</h2>
      <Link :to="{ name: ROUTES.LEVELS }">Go to the levels</Link>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

import Link from '@/components/Link.vue';
import Modal from '@/components/Modal.vue';
import { ROUTES } from '@/router';

const store = useStore();

const gameResult = computed(() => store.state.gameResult);
</script>

<style scoped lang="scss">
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
