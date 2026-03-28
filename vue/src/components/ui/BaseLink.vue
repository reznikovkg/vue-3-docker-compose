<template>
    <RouterLink :to="to" class="base-link" :class="`base-link--${variant}`">
        <span>{{ title }}</span>
    </RouterLink>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

interface Props {
    to: RouteLocationRaw;
    title: string
    variant?: 'primary' | 'secondary';
}

withDefaults(defineProps<Props>(), {
    variant: 'primary',
});
</script>

<style scoped lang="scss">
.base-link {
    width: 100%;
    padding: 24px;
    font-size: 18px;
    font-weight: 600;
    border-radius: var(--vt-radius-default);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &--primary {
        background-color: var(--vt-c-green);
        color: var(--vt-c-white);

        &:hover {
            background-color: var(--vt-c-green-hover);
        }
    }

    &--secondary {
        background-color: var(--color-background-soft);
        color: var(--vt-c-white);
        border: 1px solid var(--color-border);
        backdrop-filter: var(--vt-blur-default);

        &:hover {
            background-color: var(--color-background-mute);
        }
    }
}
</style>
