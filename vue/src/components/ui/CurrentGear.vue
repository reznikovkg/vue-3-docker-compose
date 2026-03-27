<template>
    <div>
        <div class="current-gear" v-if="getCurrentGear">
            <div v-if="selectedBait" class="current-gear__item">
                <img :src="selectedBait.icon" :alt="selectedBait.name" class="current-gear__icon" />
                <div class="current-gear__info">
                    {{ selectedBait.name }}
                </div>
            </div>
            <div v-for="gear in getCurrentGear" :key="gear.type" class="current-gear__item">
                <img :src="gear.icon" :alt="gear.name" class="current-gear__icon" />
                <div class="current-gear__info">
                    {{ gear.name }}
                </div>
            </div>
        </div>

        <div class="consumables">
            <div v-if="consumables" v-for="(cons, index) in consumables" :key="cons.c.id" class="consumables__item">
                <img :src="cons.c.icon" :alt="cons.c.name" class="consumables__icon" />
                <span class="consumables__name">{{ cons.c.name }}
                    <span v-if="cons.amount === -1">(∞)</span>
                    <span v-else>({{ cons.amount }})</span>
                </span>
                <button v-if="cons.c.type === 'bait'" class="consumables__switch-btn" @click="() => switchBait(index)">
                    Switch</button>
            </div>
        </div>
    </div>
</template>

<script>
import { CONSUMABLES_MAP } from '@/consumables';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
    computed: {
        ...mapState(['selectedBaitId', 'ownedConsumables']),
        ...mapGetters(['getCurrentGear']),

        selectedBait() {
            return CONSUMABLES_MAP[this.selectedBaitId]
        },
        consumables() {
            return this.ownedConsumables
        }
    },
    methods: {
        ...mapActions(['switchBait'])
    }
};
</script>

<style scoped lang="scss">
.current-gear {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    gap: 10px;
    background: rgba(0, 0, 0, 0.6);
    padding: 6px 10px;
    border-radius: 6px;
    color: white;

    &__item {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    &__icon {
        width: 32px;
        height: 32px;
    }

    &__info {
        font-weight: bold;
        font-size: 14px;
    }
}

.consumables {
    position: absolute;
    bottom: 10px;
    left: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: rgba(0, 0, 0, 0.6);
    padding: 6px 10px;
    border-radius: 6px;
    color: white;

    &__item {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    &__icon {
        width: 28px;
        height: 28px;
    }

    &__switch-btn {
        background: #00a000;
        color: white;
        border: none;
        border-radius: 3px;
        padding: 2px 6px;
        font-size: 12px;
        cursor: pointer;
    }

    &__name {
        font-weight: bold;
        font-size: 14px;
    }
}
</style>