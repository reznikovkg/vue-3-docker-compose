import { ref, onMounted, onUnmounted } from 'vue';

export function useGameLoop(callback) {
const isRunning = ref(false);
let animationId = null;
let lastTime = 0;

const loop = (currentTime) => {
    if (!isRunning.value) return;

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    callback(deltaTime);
    animationId = requestAnimationFrame(loop);
};

const start = () => {
    if (!isRunning.value) {
      isRunning.value = true;
      lastTime = performance.now();
      animationId = requestAnimationFrame(loop);
    }
};

const stop = () => {
    isRunning.value = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
};

onUnmounted(() => {
    stop();
});

return {
    isRunning,
    start,
    stop
};
}