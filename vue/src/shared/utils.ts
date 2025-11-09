export const createGameLoop = (update: (deltaTime: number) => void) => {
  let animationFrameId: number | null = null;
  let lastTime = 0;

  const loop = (timestamp: number) => {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);

    animationFrameId = requestAnimationFrame(loop);
  };

  const start = () => {
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  return { start, stop };
};
