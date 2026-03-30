<template>
    <div class="game-screen">
        <div class="sidebar-left">
            <NavDisplay />
            <HookQTE />
        </div>
        <SeaCanvas />
        <div class="sidebar-right">
            <CatchLog />
        </div>
        <Vessel />
    </div>
</template>

<script setup>
import SeaCanvas from '@/components/SeaCanvas.vue'
import Vessel from '@/components/Vessel.vue'
import NavDisplay from '@/components/NavDisplay.vue'
import CatchLog from '@/components/CatchLog.vue'
import HookQTE from '@/components/HookQTE.vue'
</script>

<style scoped lang="scss">
.game-screen {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.sidebar-left,
.sidebar-right {
    position: absolute;
    top: 0;
    height: 100vh;
    width: 300px;
    z-index: 10;
    pointer-events: none;
}

.sidebar-left {
    left: 0;
}

.sidebar-right {
    right: 0;
}

@media (max-width: 768px) {

    .sidebar-left,
    .sidebar-right {
        width: 250px;
    }
}
</style>
