<template>
  <div
    v-if="props.isComplete"
    class="gamePage__overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="gamePageWinnerTitle"
  >
    <div class="gamePage__overlayPanel">
      <p id="gamePageWinnerTitle" class="gamePage__overlayTitle">
        winner winner chicken dinner
      </p>

      <button
        type="button"
        class="gamePage__overlayAction"
        @click="() => onActionClick()"
      >
        Hooray!
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isComplete: boolean
}>()

const emit = defineEmits<{
  (event: 'action'): void
}>()

const onActionClick = () => {
  emit('action')
}
</script>

<style scoped lang="scss">

.gamePage {
  &__overlay {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: grid;
    place-items: center;
    padding: var(--gameSpace4);
    background: color-mix(in srgb, var(--color-background) 70%, transparent);

    &Panel {
      display: grid;
      justify-items: center;
      gap: var(--gameSpace3);
      padding: var(--gameSpace4);
      border: 1px solid var(--color-border-hover);
      background: color-mix(
        in srgb,
        var(--color-background-soft) 92%,
        transparent
      );
      min-width: min(100%, 22rem);
    }

    &Title {
      color: var(--color-heading);
      font-size: clamp(1.5rem, 3vw, 2rem);
      line-height: 1.2;
      text-align: center;
    }

    &Action {
      min-width: 6rem;
      border: 1px solid var(--color-border-hover);
      background: color-mix(in srgb, var(--color-background) 78%, transparent);
      color: var(--color-heading);
      font: inherit;
      opacity: 1;
      padding: var(--gameSpace1) var(--gameSpace2);
      line-height: 1.2;
    }
  }
}
</style>
