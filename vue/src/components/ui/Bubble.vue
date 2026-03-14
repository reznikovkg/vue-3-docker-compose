<template>
    <div class="bubble" @click="(e) => handleClick(e)" ref="bubble" :style="bubbleStyle">
        <img :src="imageSrc" class="bubble__image">
    </div>
</template>





<script>
import blueBubble from './../../assets/bubbles/bubble_blue.png'
import greenBubble from './../../assets/bubbles/bubble_green.png'
import orangeBubble from './../../assets/bubbles/bubble_orange.png'
import pinkBubble from './../../assets/bubbles/bubble_pink.png'
import purpleBubble from './../../assets/bubbles/bubble_purple.png'
import redBubble from './../../assets/bubbles/bubble_red.png'
import whiteBubble from './../../assets/bubbles/bubble_white.png'
import yellowBubble from './../../assets/bubbles/bubble_yellow.png'


export default {
    name: 'Bubble',
    props: {
        color: {
            type: String,
            default: 'white'
        },
        initialX: {
            type: Number,
            default: 0
        },
        initialY: {
            type: Number,
            default: 0
        },
        isPaused: {
            type: Boolean,
            default: false
        }
    },
    emits: ['pop'],
    data() {
        return {
            coords: {
                x: this.initialX,
                y: this.initialY,
                speedX: (Math.random() - 0.5) * 2,
                speedY: 1 + Math.random() * 2,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.03
            },
            active: true,
            animationFrame: null
        }
    },
    computed: {
        imageSrc() {
            switch(this.color) {
                case 'blue': return blueBubble
                case 'green': return greenBubble
                case 'orange': return orangeBubble
                case 'pink': return pinkBubble
                case 'purple': return purpleBubble
                case 'red': return redBubble
                case 'white': return whiteBubble
                case 'yellow': return yellowBubble
                default: return whiteBubble
            }
        },
        bubbleStyle() {
            return {
                transform: `translateX(${this.coords.x}px) translateY(${this.coords.y}px)`,
                transition: '0.1s linear'
            }
        }
    },
    methods: {
        move() {
            if (!this.active) 
                return

            if (this.isPaused) {
                this.animationFrame = requestAnimationFrame(this.move)
                return
            }

            this.coords.x += this.coords.speedX
            this.coords.y += this.coords.speedY

            this.coords.wobble += this.coords.wobbleSpeed
            this.coords.x += Math.sin(this.coords.wobble) * 0.5

            const isOutOfBounds = this.coords.y > window.innerHeight + 100 || this.coords.x < -100 || this.coords.x > window.innerWidth + 100

            if (isOutOfBounds) {
                this.pop('out-of-bounds') 
                return
            }


            this.animationFrame = requestAnimationFrame(this.move)
        },
        handleClick(event) {
            if (!this.active) 
                return

            const rect = this.$refs.bubble.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            
            const distance = Math.sqrt(
                Math.pow(event.clientX - centerX, 2) + 
                Math.pow(event.clientY - centerY, 2)
            )
            const radius = rect.width / 2
            
            if (distance <= radius) {
                this.pop('popped')
            }
        },
        pop(reason = 'popped') {
            if (!this.active) 
                return
            
            this.active = false
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame)
            }
            
            this.$emit('pop', { color: this.color, reason: reason })
        }
    },
    mounted() {
        this.animationFrame = requestAnimationFrame(this.move)
    },
    beforeDestroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame)
        }
    }
}
</script>





<style lang="scss">
.bubble {
    width: 80px;
    height: 80px;
    position: absolute;
    will-change: transform;
    
    &__image {
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 50%;
        object-fit: cover;
        pointer-events: none;
        transition: transform 0.1s ease;
    }
    
    &:active &__image {
        transform: scale(0.95);
    }
}
</style>