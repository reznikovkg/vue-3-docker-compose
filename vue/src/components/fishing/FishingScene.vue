<template>
  <section class="fishing-scene">
    <div class="fishing-scene__viewport">
      <div class="fishing-scene__surface" :style="surfaceStyle">
        <img
          v-if="hasRenderableBackgroundImage"
          class="fishing-scene__image"
          :src="backgroundImagePath"
          :alt="locationName"
        />
        <BobberView
          v-if="showBobber"
          :anchor-position="bobber.anchorPosition"
          :is-energized="bobber.isEnergized"
          :mode="bobber.mode"
          :progress="bobber.progress"
          :target-position="bobber.targetPosition"
        />
        <div v-if="showWaterOverlay" class="fishing-scene__water"></div>
        <div v-if="showFallbackNote" class="fishing-scene__fallback-note">
          {{ fallbackNote }}
        </div>
        <div class="fishing-scene__caption">
          {{ locationName }}
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import BobberView from '@/components/fishing/BobberView.vue';

export default {
  name: 'FishingScene',
  components: {
    BobberView,
  },
  props: {
    bobber: {
      type: Object,
      default: null,
    },
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
    surfaceStyle() {
      const baseGradient =
        'linear-gradient(180deg, #9bc6ea 0%, #6ba0c7 48%, #3f6e6d 49%, #44685d 100%)';

      return {
        backgroundImage: baseGradient,
      };
    },
    showWaterOverlay() {
      return !this.hasRenderableBackgroundImage;
    },
    showBobber() {
      return Boolean(
        this.bobber?.isVisible && this.hasRenderableBackgroundImage,
      );
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
@use '@/styles/tokens' as tokens;

.fishing-scene {
  height: 100%;
  width: 100%;

  &__viewport {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    padding: 0 tokens.$fishing-scene-viewport-padding;
    width: 100%;
  }

  &__surface {
    aspect-ratio: 3 / 2;
    background-color: tokens.$fishing-scene-surface-background;
    box-shadow: inset 0 0 0 1px tokens.$fishing-scene-surface-border;
    overflow: hidden;
    position: relative;
    width: min(
      100%,
      tokens.$fishing-scene-image-max-width,
      calc((100dvh - tokens.$fishing-scene-viewport-height-offset) * 1.5)
    );
  }

  &__image {
    display: block;
    height: 100%;
    inset: 0;
    object-fit: cover;
    position: absolute;
    width: 100%;
  }

  &__water {
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

  &__caption {
    background: tokens.$fishing-scene-caption-background;
    border-radius: tokens.$fishing-scene-caption-radius;
    bottom: tokens.$fishing-scene-caption-offset;
    color: #fff;
    font-size: tokens.$fishing-scene-caption-font-size;
    left: tokens.$fishing-scene-caption-offset;
    letter-spacing: 0.04em;
    padding: tokens.$fishing-scene-caption-padding-y
      tokens.$fishing-scene-caption-padding-x;
    position: absolute;
    text-transform: uppercase;
  }

  &__fallback-note {
    background: tokens.$fishing-scene-fallback-background;
    border: 1px solid tokens.$fishing-scene-fallback-border;
    border-radius: tokens.$fishing-scene-caption-radius;
    color: tokens.$fishing-scene-fallback-text;
    font-size: tokens.$fishing-scene-caption-font-size;
    left: tokens.$fishing-scene-caption-offset;
    max-width: calc(100% - (tokens.$fishing-scene-caption-offset * 2));
    padding: tokens.$fishing-scene-caption-padding-y
      tokens.$fishing-scene-caption-padding-x;
    position: absolute;
    top: tokens.$fishing-scene-caption-offset;
  }
}

@media (max-width: tokens.$fishing-breakpoint-tablet) {
  .fishing-scene {
    &__viewport {
      padding: 0;
    }
  }
}
</style>
