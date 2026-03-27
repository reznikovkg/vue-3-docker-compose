<template>
    <div class="shop">
        <div v-for="type in getGearTypes" :key="type" class="shop__gear-type">
            <h4 class="shop__title">{{ type }}</h4>

            <div v-if="getNextGearByType[type]" class="shop__item">
                <img :src="gearList[getNextGearByType[type]].icon" :alt="gearList[getNextGearByType[type]].name"
                    class="shop__item-icon" />

                <div class="shop__item-info">
                    <div>{{ gearList[getNextGearByType[type]].name }}</div>
                    <div>
                        Price: {{ gearList[getNextGearByType[type]].price }}
                        Power: {{ getOwnedGearPower[type] }} -> {{ gearList[getNextGearByType[type]].power }}
                    </div>
                </div>

                <button class="shop__buy-btn" @click="() => tryBuyGear(getNextGearByType[type])">Buy</button>
            </div>
        </div>

        <div class="shop__section">
            <h3 class="shop__title">Consumables</h3>

            <div v-for="c in consumablesList" :key="c.id" class="shop__item">
                <img :src="c.icon" :alt="c.name" class="shop__item-icon" />

                <div class="shop__item-info">
                    <div>{{ c.name }}</div>
                    <div>Price: {{ c.price }}</div>
                </div>

                <button class="shop__buy-btn" @click="() => tryBuyConsumable(c.id)">Buy</button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { GEAR_MAP } from '@/gear'
import { CONSUMABLES_MAP } from '@/consumables'

export default {
    name: 'Shop',
    computed: {
        ...mapGetters(['getGearTypes', 'getNextGearByType', 'getOwnedGearPower']),
        gearList() {
            return GEAR_MAP
        },

        consumablesList() {
            const filtered = []
            for (const c of Object.values(CONSUMABLES_MAP)) {
                console.log(111111)
                console.log(c.id)
                if (c.price > 0)
                    filtered.push(c)
            }

            return filtered
        }
    },
    methods: {
        ...mapActions(['tryBuyGear', 'tryBuyConsumable'])
    }
}
</script>

<style scoped lang="scss">
.shop {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 250px;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px;
    border-radius: 8px;
    color: #fff;
    user-select: none;
    z-index: 111;

    &__section {
        margin-bottom: 20px;
    }

    &__title {
        text-align: center;
        font-weight: bold;
        margin-bottom: 8px;
    }

    &__gear-type {
        margin-bottom: 10px;
    }

    &__item {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
    }

    &__item-icon {
        width: 32px;
        height: 32px;
        margin-right: 8px;
    }

    &__item-info {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        font-size: 12px;

        &>div:first-child {
            font-weight: bold;
            font-size: 14px;
        }
    }

    &__buy-btn {
        background: #4aa1f3;
        border: none;
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
            background: #3a81d3;
        }
    }
}
</style>