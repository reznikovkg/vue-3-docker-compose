<template>
    <div 
    class = "flask"
    :class = "{ 'flask--active': active, 'flask--blocked': blocked }"
    @click = "() => handleClick()"
    >
        <div class = "flask__liquid">
            <div
                v-for = "(layer, index) in layers"
                :key = "index"
                class = "flask__layer"
                :style = "{
                    backgroundColor: getColour(layer),
                    height: getLayerHeight() + '%',
                }"
            ></div>
        </div>
        <div class = "flask__label">
            {{ label }}
        </div>
        <div v-if="blocked" class = "flask__blocked-icon">X</div>
    </div>
</template>

<script>
export default {
    name: 'Flask',

    emits: ['click'],

    props: {
        layers: {
            type: Array,
            default: () => []
        },
        active: {
            type: Boolean,
            default: false
        },
        label: {
            type: String,
            default: ''
        },
        maxLayers: {
            type: Number,
            default: 4
        },
        blocked: {
            type: Boolean,
            default: false
        }
    },

    methods: {
        handleClick() {
            if (!this.blocked) {
                this.$emit('click')
            }
        },
        getColour(layer) {
            const colours = {
                1: '#FF6B6B',
                2: '#4ECDC4',
                3: '#45B7D1',
                4: '#FFA07A'
            }
            return colours[layer] || '#95A5A6'
        },
        getLayerHeight() {
            return 100 / this.maxLayers
        }
    }
}
</script>

<style scoped lang = "scss">
.flask {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 10px;
    transition: transform 0.2s;
    position: relative;

    &:hover {
        transform: translateY(-5px);
    }

    &--active {
        transform: translateY(-10px);
    }

    &__liquid {
        width: 50px;
        height: 200px;
        border: 3px solid #2C3E50;
        border-radius: 0 0 10px 10px;
        border-top: none;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column-reverse;
    }

    &__layer {
        width: 100%;
        transition: height 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.1);
    }

    &__label {
        margin-top: 10px;
        font-size: 14px;
        color: #2C3E50;
        font-weight: bold;
    }

    &--blocked {
        opacity: 0.6;
        cursor: not-allowed;
        &:hover {
            transform: none;
        }
    }

    &__blocked-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        pointer-events: none;
        color: #E74C3C;
        font-weight: bold;
    }
}
</style>