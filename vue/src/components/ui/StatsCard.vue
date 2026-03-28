<template>
    <div class="stats-card" :class="`stats-card--${variant}`">
        <p class="stats-card__label">{{ label }}</p>
        <div class="stats-card__value">
            <span class="stats-card__emoji" :class="`stats-card__emoji--${variant}`">🏆</span>
            <span class="stats-card__number" :class="`stats-card__number--${variant}`">
                {{ score }}м
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    score: number;
    label: string;
    variant: 'main' | 'small';
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.stats-card {
    text-align: center;
    display: flex;
    flex-direction: column;
    border-radius: var(--vt-radius-default);
    backdrop-filter: var(--vt-blur-default);

    &--main {
        padding: 24px;
        background-color: var(--color-background-soft);
        border: 2px solid var(--color-border);
    }

    &--small {
        padding: 16px;
        background-color: var(--color-background-mute);
        border: 1px solid var(--color-border);
    }

    &__label {
        font-size: 18px;
        color: var(--vt-c-blue-soft);
    }

    &__value {
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 8px;
    }

    &__number {
        font-size: 48px;
        font-weight: 700;
        color: var(--vt-c-blue-soft);

        &--small {
            font-size: 32px;
            color: var(--vt-c-yellow);
        }
    }

    &__emoji {
        font-size: 32px;

        &--small {
            font-size: 24px;
        }
    }
}
</style>
