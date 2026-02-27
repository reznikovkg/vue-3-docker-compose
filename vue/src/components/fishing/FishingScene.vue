<template>
  <section class="fishing-scene">
    <div class="fishing-scene__surface" :style="backgroundStyle">
      <div v-if="showWaterOverlay" class="fishing-scene__water"></div>
      <div v-if="showFallbackNote" class="fishing-scene__fallback-note">
        {{ fallbackNote }}
      </div>
      <div class="fishing-scene__caption">
        {{ locationName }}
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FishingScene',
  props: {
    location: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      imageLoadState: 'idle',
      imageLoadPath: null,
    };
  },
  computed: {
    backgroundImagePath() {
      return this.location?.bgImage || '';
    },
    hasBackgroundImage() {
      return Boolean(this.backgroundImagePath);
    },
    hasRenderableBackgroundImage() {
      return this.hasBackgroundImage && this.imageLoadState === 'loaded';
    },
    backgroundStyle() {
      const baseGradient =
        'linear-gradient(180deg, #9bc6ea 0%, #6ba0c7 48%, #3f6e6d 49%, #44685d 100%)';

      if (!this.hasRenderableBackgroundImage) {
        return {
          backgroundImage: baseGradient,
        };
      }

      return {
        backgroundImage: `url("${this.backgroundImagePath}")`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      };
    },
    showWaterOverlay() {
      return !this.hasRenderableBackgroundImage;
    },
    locationName() {
      return this.location?.name || 'Unknown location';
    },
    showFallbackNote() {
      return (
        !this.hasRenderableBackgroundImage && this.imageLoadState !== 'loading'
      );
    },
    fallbackNote() {
      if (!this.location) {
        return 'Location data is missing. Showing fallback scene.';
      }

      if (!this.hasBackgroundImage) {
        return 'Background image is missing. Showing fallback scene.';
      }

      return 'Background file could not be loaded. Showing fallback scene.';
    },
  },
  watch: {
    backgroundImagePath: {
      immediate: true,
      handler(nextPath) {
        this.resolveBackgroundImageState(nextPath);
      },
    },
  },
  methods: {
    resolveBackgroundImageState(nextPath) {
      if (!nextPath) {
        this.imageLoadPath = null;
        this.imageLoadState = 'idle';
        return;
      }

      this.imageLoadPath = nextPath;
      this.imageLoadState = 'loading';
      const probe = new Image();

      probe.onload = () => {
        if (this.imageLoadPath !== nextPath) {
          return;
        }

        this.imageLoadState = 'loaded';
      };

      probe.onerror = () => {
        if (this.imageLoadPath !== nextPath) {
          return;
        }

        this.imageLoadState = 'error';
      };

      probe.src = nextPath;
    },
  },
};
</script>

<style scoped lang="scss">
.fishing-scene {
  width: 100%;
}

.fishing-scene__surface {
  aspect-ratio: 16 / 9;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.fishing-scene__water {
  backdrop-filter: blur(0.4px);
  background: linear-gradient(
    180deg,
    rgba(56, 103, 140, 0.18) 0%,
    rgba(22, 71, 92, 0.35) 100%
  );
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 45%;
}

.fishing-scene__caption {
  background: rgba(0, 0, 0, 0.38);
  border-radius: 8px;
  bottom: 10px;
  color: #fff;
  font-size: 12px;
  left: 10px;
  padding: 4px 8px;
  position: absolute;
}

.fishing-scene__fallback-note {
  background: rgba(250, 231, 195, 0.95);
  border: 1px solid #d68429;
  border-radius: 8px;
  color: #5c2f00;
  font-size: 12px;
  left: 10px;
  max-width: calc(100% - 20px);
  padding: 4px 8px;
  position: absolute;
  top: 10px;
}
</style>
