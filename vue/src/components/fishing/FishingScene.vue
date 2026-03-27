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
          Press S to use landing net
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
    BobberView
  },
  props: {
    bobber: {
      type: Object,
      default: null
    },
    location: {
      type: Object,
      default: null
    },
    groundbaitArea: {
      type: Object,
      default: null
    },
    showLandingNetBadge: {
      type: Boolean,
      default: false
    }
  },
  emits: ['cast'],
  data() {
    return {
      backgroundImageFailed: false
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
        backgroundImage: baseGradient
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
        area.radiusPct > 0
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
        height: `${diameter}%`
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
        this.bobber?.isVisible && this.hasRenderableBackgroundImage
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
        1
      )
      return {
        x:
          this.bobber.anchorPosition.x +
          (this.bobber.targetPosition.x - this.bobber.anchorPosition.x) *
            progress,
        y:
          this.bobber.anchorPosition.y +
          (this.bobber.targetPosition.y - this.bobber.anchorPosition.y) *
            progress
      }
    },
    landingNetBadgeStyle() {
      if (!this.bobberPosition) {
        return {}
      }

      return {
        left: `${this.bobberPosition.x}%`,
        top: `${this.bobberPosition.y}%`
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
    }
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
        100
      )
      const y = this.clamp(
        ((event.clientY - bounds.top) / bounds.height) * 100,
        0,
        100
      )

      this.$emit('cast', {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2))
      })
    }
  }
}
</script>

<style scoped lang="scss">
.fishing-scene {
  height: 100%;
  width: 100%;

  &__viewport {
    display: grid;
    height: 100%;
    place-items: center;
    width: 100%;
  }

  &__surface {
    aspect-ratio: 3 / 2;
    border: 1px solid rgba(255, 255, 255, 0.35);
    overflow: hidden;
    position: relative;
    width: min(100%, 1440px, calc((100dvh - 180px) * 1.5));
  }

  &__image {
    height: 100%;
    inset: 0;
    object-fit: cover;
    position: absolute;
    width: 100%;
  }

  &__water {
    background: linear-gradient(
      180deg,
      rgba(56, 103, 140, 0.18),
      rgba(22, 71, 92, 0.35)
    );
    inset: 45% 0 0;
    position: absolute;
  }

  &__caption,
  &__fallback-note {
    border-radius: 8px;
    font-size: 12px;
    left: 12px;
    padding: 4px 8px;
    position: absolute;
  }

  &__caption {
    background: rgba(0, 0, 0, 0.38);
    bottom: 12px;
    color: #fff;
  }

  &__fallback-note {
    background: rgba(250, 231, 195, 0.95);
    border: 1px solid #d68429;
    color: #5c2f00;
    top: 12px;
  }

  &__groundbait-area {
    background: radial-gradient(
      circle,
      rgba(246, 219, 121, 0.22) 0%,
      rgba(224, 156, 39, 0.14) 58%,
      rgba(204, 118, 24, 0.08) 100%
    );
    border: 1px dashed rgba(238, 186, 80, 0.9);
    border-radius: 50%;
    left: 50%;
    pointer-events: auto;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;

    &:hover .fishing-scene__groundbait-label {
      opacity: 1;
      transform: translate(-50%, calc(-100% - 8px));
    }
  }

  &__groundbait-label {
    background: rgba(7, 14, 24, 0.9);
    border: 1px solid rgba(234, 204, 140, 0.7);
    border-radius: 6px;
    color: #f6e7c3;
    font-size: 11px;
    left: 50%;
    opacity: 0;
    padding: 3px 6px;
    pointer-events: none;
    position: absolute;
    top: 0;
    transform: translate(-50%, calc(-100% - 4px));
    transition:
      opacity 0.12s ease,
      transform 0.12s ease;
    white-space: nowrap;
    z-index: 3;
  }

  &__landing-net-badge {
    background: rgba(12, 26, 41, 0.92);
    border: 1px solid rgba(152, 214, 255, 0.72);
    border-radius: 999px;
    color: #eaf6ff;
    font-size: 11px;
    font-weight: 600;
    left: 0;
    line-height: 1;
    padding: 6px 10px;
    pointer-events: none;
    position: absolute;
    top: 0;
    transform: translate(-50%, calc(-100% - 8px));
    white-space: nowrap;
    z-index: 6;
  }
}
</style>
