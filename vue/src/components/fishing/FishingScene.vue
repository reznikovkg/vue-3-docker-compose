<template>
  <section class="fishing-scene">
    <div class="fishing-scene__viewport">
      <div
        ref="surface"
        class="fishing-scene__surface"
        :style="surfaceStyle"
        @pointerdown="(event) => emitCast(event)"
      >
        <img
          v-if="hasBackgroundImage"
          :key="backgroundImagePath"
          class="fishing-scene__image"
          :src="backgroundImagePath"
          :alt="locationName"
          draggable="false"
          @dragstart.prevent
          @load="() => (backgroundImageFailed = false)"
          @error="() => (backgroundImageFailed = true)"
        />
        <div
          v-if="hasGroundbaitArea"
          class="fishing-scene__groundbait-area"
          :style="groundbaitAreaStyle"
        >
          <span class="fishing-scene__groundbait-label">
            {{ groundbaitAreaLabel }}
          </span>
        </div>
        <BobberView
          v-if="showBobber"
          :anchor-position="bobber.anchorPosition"
          :is-energized="bobber.isEnergized"
          :mode="bobber.mode"
          :progress="bobber.progress"
          :target-position="bobber.targetPosition"
        />
        <div
          v-if="showLandingNetBadge && bobberPosition"
          class="fishing-scene__landing-net-badge"
          :style="landingNetBadgeStyle"
        >
          Use landing net
        </div>
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
import BobberView from '@/components/fishing/BobberView.vue'

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
    groundbaitArea: {
      type: Object,
      default: null,
    },
    showLandingNetBadge: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['cast'],
  data() {
    return {
      backgroundImageFailed: false,
    }
  },
  computed: {
    backgroundImagePath() {
      return this.location?.bgImage || ''
    },
    hasBackgroundImage() {
      return Boolean(this.backgroundImagePath)
    },
    hasRenderableBackgroundImage() {
      return this.hasBackgroundImage && !this.backgroundImageFailed
    },
    surfaceStyle() {
      const baseGradient =
        'linear-gradient(180deg, #9bc6ea 0%, #6ba0c7 48%, #3f6e6d 49%, #44685d 100%)'

      return {
        backgroundImage: baseGradient,
      }
    },
    showWaterOverlay() {
      return !this.hasRenderableBackgroundImage
    },
    hasGroundbaitArea() {
      const area = this.groundbaitArea
      return Boolean(
        area &&
        Number.isFinite(area.center?.x) &&
        Number.isFinite(area.center?.y) &&
        Number.isFinite(area.radiusPct) &&
        area.radiusPct > 0,
      )
    },
    groundbaitAreaStyle() {
      if (!this.hasGroundbaitArea) {
        return {}
      }

      const diameter = Number((this.groundbaitArea.radiusPct * 2).toFixed(2))
      return {
        left: `${this.groundbaitArea.center.x}%`,
        top: `${this.groundbaitArea.center.y}%`,
        width: `${diameter}%`,
        height: `${diameter}%`,
      }
    },
    groundbaitAreaLabel() {
      if (!this.hasGroundbaitArea) {
        return ''
      }

      const castsRemaining = Number(this.groundbaitArea.castsRemaining || 0)
      return `${this.groundbaitArea.baitName} | Tier ${this.groundbaitArea.tier} | ${castsRemaining} casts remain`
    },
    showBobber() {
      return Boolean(
        this.bobber?.isVisible && this.hasRenderableBackgroundImage,
      )
    },
    bobberPosition() {
      if (!this.showBobber) {
        return null
      }

      const mode = this.bobber?.mode
      if (mode !== 'hooked') {
        return this.bobber.anchorPosition
      }

      const progress = Math.min(
        Math.max(Number(this.bobber?.progress || 0), 0),
        1,
      )
      return {
        x:
          this.bobber.anchorPosition.x +
          (this.bobber.targetPosition.x - this.bobber.anchorPosition.x) *
            progress,
        y:
          this.bobber.anchorPosition.y +
          (this.bobber.targetPosition.y - this.bobber.anchorPosition.y) *
            progress,
      }
    },
    landingNetBadgeStyle() {
      if (!this.bobberPosition) {
        return {}
      }

      return {
        left: `${this.bobberPosition.x}%`,
        top: `${this.bobberPosition.y}%`,
      }
    },
    locationName() {
      return this.location?.name || 'Unknown location'
    },
    showFallbackNote() {
      return !this.hasRenderableBackgroundImage
    },
    fallbackNote() {
      if (!this.location) {
        return 'Location data is missing. Showing fallback scene.'
      }

      if (!this.hasBackgroundImage) {
        return 'Background image is missing. Showing fallback scene.'
      }

      return 'Background file could not be loaded. Showing fallback scene.'
    },
  },
  methods: {
    clamp(value, min, max) {
      return Math.min(max, Math.max(min, value))
    },
    emitCast(event) {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return
      }

      const surface = this.$refs.surface
      if (!surface) {
        return
      }

      const bounds = surface.getBoundingClientRect()
      if (!bounds.width || !bounds.height) {
        return
      }

      const x = this.clamp(
        ((event.clientX - bounds.left) / bounds.width) * 100,
        0,
        100,
      )
      const y = this.clamp(
        ((event.clientY - bounds.top) / bounds.height) * 100,
        0,
        100,
      )

      this.$emit('cast', {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
      })
    },
  },
}
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
    user-select: none;
    -webkit-user-drag: none;
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

  &__groundbait-area {
    align-items: center;
    background: rgba(232, 193, 84, 0.18);
    border: 2px dashed rgba(255, 220, 120, 0.88);
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgba(52, 32, 0, 0.2);
    display: flex;
    justify-content: center;
    left: 0;
    position: absolute;
    top: 0;
    transform: translate(-50%, -50%);
  }

  &__groundbait-label {
    background: rgba(15, 20, 29, 0.84);
    border-radius: 8px;
    color: #ecf2fb;
    font-size: 11px;
    opacity: 0;
    padding: 4px 6px;
    pointer-events: none;
    transform: translateY(-8px);
    transition: opacity 120ms ease;
    white-space: nowrap;
  }

  &__groundbait-area:hover &__groundbait-label {
    opacity: 1;
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

  &__landing-net-badge {
    background: rgba(12, 24, 37, 0.88);
    border: 1px solid rgba(244, 217, 134, 0.9);
    border-radius: 999px;
    color: #f6de9f;
    font-size: 11px;
    font-weight: 700;
    left: 0;
    letter-spacing: 0.02em;
    padding: 4px 9px;
    pointer-events: none;
    position: absolute;
    top: 0;
    transform: translate(-50%, -170%);
    z-index: 4;
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
