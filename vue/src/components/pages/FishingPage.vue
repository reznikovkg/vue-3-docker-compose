<template>
  <section class="fishing-page">
    <header class="fishing-page__header">
      <h1>Fishing Game</h1>
      <RouterLink :to="{ name: $routes.INDEX }">Back to Index</RouterLink>
    </header>

    <main class="fishing-page__layout">
      <aside class="fishing-page__panel">
        <h2>Locations</h2>
        <p>Select a location for your next cast.</p>
        <LocationSelector
          :locations="locations"
          :selected-location-id="selectedLocationId"
          @select="(locationId) => selectLocation(locationId)"
        />
      </aside>

      <section class="fishing-page__scene">
        <h2>Scene</h2>
        <section
          v-if="sceneWarnings.length"
          class="fishing-page__warning-panel"
          aria-live="polite"
        >
          <h3>Scene warnings</h3>
          <ul class="fishing-page__warning-list">
            <li v-for="warning in sceneWarnings" :key="warning">
              {{ warning }}
            </li>
          </ul>
        </section>
        <div class="fishing-page__cast-row">
          <button
            class="btn-soft"
            :disabled="!canCast"
            @click="() => startCast()"
          >
            Cast
          </button>
          <span
            class="fishing-page__phase-chip"
            :class="`fishing-page__phase-chip--${phase}`"
            role="status"
            aria-live="polite"
          >
            {{ phaseMessage }}
          </span>
        </div>
        <p class="fishing-page__cast-hint">
          Cast is available in idle and result phases.
        </p>
        <section
          v-if="resultPanel.isOpen"
          class="fishing-page__result-panel"
          :class="{
            'fishing-page__result-panel--success': resultPanel.isSuccess,
            'fishing-page__result-panel--fail': !resultPanel.isSuccess,
          }"
        >
          <p>{{ resultPanel.message }}</p>
          <article v-if="showCatchCard" class="fishing-page__catch-card">
            <img
              class="fishing-page__catch-image"
              :src="catchImageSrc"
              :alt="`${resultEncounter.fishName} illustration`"
              @error="(event) => onCatchImageError(event)"
            />
            <div class="fishing-page__catch-details">
              <h3>{{ resultEncounter.fishName }}</h3>
              <p class="fishing-page__catch-row">
                <strong>Tier:</strong> {{ resultEncounter.tier }}
              </p>
              <p class="fishing-page__catch-row">
                <strong>Size:</strong> {{ catchSizeLabel }}
              </p>
              <p class="fishing-page__catch-row">
                <strong>Quality:</strong> {{ catchQualityLabel }}
              </p>
              <p class="fishing-page__catch-row">
                <strong>Difficulty:</strong> {{ catchDifficultyLabel }}
              </p>
            </div>
          </article>
          <button class="btn-soft" @click="() => closeResultPanel()">
            Close
          </button>
        </section>
        <div
          class="fishing-page__play-area"
          @pointercancel="() => onReelingStop()"
          @pointerdown="() => onReelingStart()"
          @pointerleave="() => onReelingStop()"
          @pointerup="() => onReelingStop()"
        >
          <FishingScene :location="selectedLocation" />
        </div>
        <section v-if="phase === 'minigame'" class="fishing-page__minigame-hud">
          <p v-if="isBarrierBlocking">
            Mash left mouse button or Q to break barrier.
          </p>
          <p v-else>Hold left mouse button or Space to reel.</p>
          <div
            class="fishing-page__bar"
            role="img"
            :aria-label="`Green ${greenProgressPercent} percent. Red ${redProgressPercent} percent.`"
          >
            <div
              class="fishing-page__bar-fill fishing-page__bar-fill--green"
              :style="{ width: `${greenProgressPercent}%` }"
            ></div>
            <div
              class="fishing-page__bar-marker fishing-page__bar-marker--red"
              :style="{ left: `${redProgressPercent}%` }"
            ></div>
            <div
              v-for="barrier in minigameBarriers"
              :key="barrier.id"
              class="fishing-page__bar-marker fishing-page__bar-marker--barrier"
              :class="{
                'fishing-page__bar-marker--barrier-active':
                  activeBarrier && barrier.id === activeBarrier.id,
              }"
              :style="{ left: `${Math.round(barrier.position * 100)}%` }"
            ></div>
          </div>
          <p>
            Green: {{ greenProgressPercent }}% | Red: {{ redProgressPercent }}%
            | Time: {{ elapsedMsLabel }} / {{ maxTimeLabel }}
          </p>
          <p v-if="isBarrierBlocking">
            Clicks remaining: {{ barrierRemainingClicks }}
          </p>
        </section>
      </section>

      <aside class="fishing-page__panel">
        <h2>Status</h2>
        <p>Current fishing session state.</p>
        <p>Phase: {{ phase }}</p>
        <p>Selected location: {{ selectedLocationName }}</p>
        <p>Cast started: {{ castStartedAtLabel }}</p>
        <p>Encounter: {{ encounterLabel }}</p>
        <p>Reeling: {{ isReeling ? 'yes' : 'no' }}</p>
        <p>Barrier blocking: {{ isBarrierBlocking ? 'yes' : 'no' }}</p>
        <PersistenceDebugPanel
          v-if="isDevMode"
          title="Persistence Test Harness"
        />
      </aside>
    </main>
  </section>
</template>

<script>
import FishingScene from '@/components/fishing/FishingScene.vue';
import LocationSelector from '@/components/fishing/LocationSelector.vue';
import PersistenceDebugPanel from '@/components/testing/PersistenceDebugPanel.vue';

const DEFAULT_PAGE_TITLE = 'Fishing Game';
const FISH_IMAGE_FALLBACK = '/images/fish/fish-placeholder.svg';
const PHASE_PAGE_TITLES = Object.freeze({
  idle: 'Looking for fish...',
  waitingBite: 'Patiently waiting...',
  minigame: '3..2..1.. FIGHT!',
  result: 'Another one!',
});

export default {
  name: 'FishingPage',
  components: {
    FishingScene,
    LocationSelector,
    PersistenceDebugPanel,
  },
  data() {
    return {
      useFallbackCatchImage: false,
    };
  },
  computed: {
    isDevMode() {
      return import.meta.env.DEV;
    },
    locations() {
      return this.$store.getters['content/getLocations'];
    },
    configWarnings() {
      return this.$store.getters['content/getConfigWarnings'];
    },
    selectedLocationWarnings() {
      const locationId =
        this.selectedLocationId || this.selectedLocation?.id || null;

      if (!locationId) {
        return [];
      }

      return this.$store.getters['content/getLocationWarnings'](locationId);
    },
    sceneWarnings() {
      return [
        ...new Set([...this.configWarnings, ...this.selectedLocationWarnings]),
      ];
    },
    phase() {
      return this.$store.getters['gameSession/getPhase'];
    },
    phaseMessage() {
      if (this.phase === 'waitingBite') {
        return 'Waiting for bite...';
      }

      if (this.phase === 'minigame') {
        return 'Fish bite detected.';
      }

      if (this.phase === 'result') {
        return `Result: ${this.resultLabel}`;
      }

      return 'Ready to cast.';
    },
    canCast() {
      return this.phase === 'idle' || this.phase === 'result';
    },
    castStartedAt() {
      return this.$store.getters['gameSession/getCastStartedAt'];
    },
    castStartedAtLabel() {
      if (!this.castStartedAt) {
        return 'n/a';
      }

      return new Date(this.castStartedAt).toLocaleTimeString();
    },
    encounter() {
      return this.$store.getters['gameSession/getEncounter'];
    },
    result() {
      return this.$store.getters['gameSession/getResult'];
    },
    resultPanel() {
      return this.$store.getters['ui/getResultPanel'];
    },
    resultEncounter() {
      return this.result?.encounter || null;
    },
    showCatchCard() {
      return Boolean(
        this.resultPanel.isOpen &&
        this.resultPanel.isSuccess &&
        this.resultEncounter,
      );
    },
    catchImageSrc() {
      if (!this.resultEncounter || this.useFallbackCatchImage) {
        return FISH_IMAGE_FALLBACK;
      }

      return `/images/fish/${this.resultEncounter.fishId}.png`;
    },
    catchSizeLabel() {
      if (!this.resultEncounter) {
        return 'n/a';
      }

      return `${Number(this.resultEncounter.size || 0).toFixed(2)} kg`;
    },
    catchQualityLabel() {
      if (!this.resultEncounter) {
        return 'n/a';
      }

      return Number(this.resultEncounter.quality || 0).toFixed(2);
    },
    catchDifficultyLabel() {
      if (!this.resultEncounter) {
        return 'n/a';
      }

      return Number(this.resultEncounter.difficultyScore || 0).toFixed(2);
    },
    resultLabel() {
      if (!this.result) {
        return 'none';
      }

      if (this.result.status === 'success') {
        return 'success';
      }

      return 'fail';
    },
    encounterLabel() {
      if (!this.encounter) {
        return 'none';
      }

      return `${this.encounter.fishName} (tier ${this.encounter.tier}, diff ${this.encounter.difficultyScore})`;
    },
    selectedLocationId() {
      return this.$store.getters['progress/getSelectedLocationId'];
    },
    selectedLocation() {
      if (!this.selectedLocationId) {
        return this.locations[0] || null;
      }

      return this.$store.getters['content/getLocationById'](
        this.selectedLocationId,
      );
    },
    selectedLocationName() {
      return this.selectedLocation?.name || 'none';
    },
    minigameState() {
      return this.$store.getters['gameSession/getMinigameState'];
    },
    minigameBarriers() {
      return this.minigameState.config?.barriers || [];
    },
    activeBarrier() {
      return this.$store.getters['gameSession/getActiveBarrier'];
    },
    barrierRemainingClicks() {
      return this.$store.getters['gameSession/getBarrierRemainingClicks'];
    },
    isBarrierBlocking() {
      return this.$store.getters['gameSession/getIsBarrierBlocking'];
    },
    isReeling() {
      return Boolean(this.minigameState.isReeling);
    },
    greenProgressPercent() {
      return Math.round((this.minigameState.greenProgress || 0) * 100);
    },
    redProgressPercent() {
      return Math.round((this.minigameState.redProgress || 0) * 100);
    },
    elapsedMsLabel() {
      return `${Math.round(this.minigameState.elapsedMs || 0)}ms`;
    },
    maxTimeLabel() {
      const maxMs = this.minigameState.config?.maxTimeMs || 0;
      return `${maxMs}ms`;
    },
  },
  watch: {
    phase(nextPhase) {
      if (nextPhase !== 'minigame') {
        this.onReelingStop();
      }

      this.applyPageTitle(nextPhase);
    },
    resultEncounter() {
      this.useFallbackCatchImage = false;
    },
  },
  mounted() {
    window.addEventListener('pointerup', this.onReelingStop);
    window.addEventListener('blur', this.onReelingStop);
    window.addEventListener('keydown', this.onWindowKeyDown);
    window.addEventListener('keyup', this.onWindowKeyUp);
  },
  beforeUnmount() {
    window.removeEventListener('pointerup', this.onReelingStop);
    window.removeEventListener('blur', this.onReelingStop);
    window.removeEventListener('keydown', this.onWindowKeyDown);
    window.removeEventListener('keyup', this.onWindowKeyUp);
    this.applyPageTitle();
  },
  created() {
    this.applyPageTitle(this.phase);

    if (!this.selectedLocationId && this.locations.length) {
      this.selectLocation(this.locations[0].id);
    }
  },
  methods: {
    resolvePageTitle(phase) {
      return PHASE_PAGE_TITLES[phase] || DEFAULT_PAGE_TITLE;
    },
    applyPageTitle(phase) {
      document.title = this.resolvePageTitle(phase);
    },
    selectLocation(locationId) {
      this.$store.dispatch('progress/selectLocation', locationId);
    },
    startCast() {
      this.$store.dispatch('gameSession/startCast');
    },
    isEditableTarget(target) {
      const element = target;
      if (!element || typeof element.closest !== 'function') {
        return false;
      }

      return Boolean(
        element.closest('input, textarea, select, [contenteditable="true"]'),
      );
    },
    onWindowKeyDown(event) {
      if (this.isEditableTarget(event.target)) {
        return;
      }

      if (event.code === 'Space') {
        if (this.phase !== 'minigame') {
          return;
        }

        event.preventDefault();
        if (this.isBarrierBlocking) {
          return;
        }

        this.$store.dispatch('gameSession/setReeling', true);
        return;
      }

      if (event.key?.toLowerCase() !== 'q') {
        return;
      }

      if (
        this.phase !== 'minigame' ||
        !this.isBarrierBlocking ||
        event.repeat
      ) {
        return;
      }

      event.preventDefault();
      this.$store.dispatch('gameSession/registerBarrierClick');
    },
    onWindowKeyUp(event) {
      if (this.isEditableTarget(event.target)) {
        return;
      }

      if (event.code !== 'Space') {
        return;
      }

      if (this.phase !== 'minigame') {
        return;
      }

      event.preventDefault();
      this.$store.dispatch('gameSession/setReeling', false);
    },
    onReelingStart() {
      if (this.isBarrierBlocking) {
        this.$store.dispatch('gameSession/registerBarrierClick');
        return;
      }

      this.$store.dispatch('gameSession/setReeling', true);
    },
    onReelingStop() {
      this.$store.dispatch('gameSession/setReeling', false);
    },
    onCatchImageError() {
      if (this.useFallbackCatchImage) {
        return;
      }

      this.useFallbackCatchImage = true;
    },
    closeResultPanel() {
      this.$store.dispatch('ui/hideResultPanel');
    },
  },
};
</script>

<style scoped lang="scss">
.fishing-page {
  padding: 16px;
}

.fishing-page__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.fishing-page__layout {
  display: grid;
  gap: 12px;
  grid-template-columns: 240px 1fr 240px;
}

.fishing-page__panel,
.fishing-page__scene {
  border: 1px solid #9da8b7;
  border-radius: 8px;
  min-height: 240px;
  padding: 12px;
}

.fishing-page__warning-panel {
  background: #fff3e7;
  border: 1px solid #d68429;
  border-radius: 8px;
  color: #5c2f00;
  margin-bottom: 10px;
  padding: 10px;
}

.fishing-page__warning-panel h3 {
  font-size: 14px;
  margin: 0 0 6px;
}

.fishing-page__warning-list {
  margin: 0;
  padding-left: 18px;
}

.fishing-page__cast-row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.fishing-page__cast-hint {
  color: #394555;
  font-size: 13px;
  margin: 0 0 10px;
}

.fishing-page__phase-chip {
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
}

.fishing-page__phase-chip--idle,
.fishing-page__phase-chip--casting {
  background: #e6ecf4;
  color: #314155;
}

.fishing-page__phase-chip--waitingBite {
  background: #e9f4ff;
  color: #0f3f75;
}

.fishing-page__phase-chip--minigame {
  background: #ffeccc;
  color: #7a3f00;
}

.fishing-page__phase-chip--result {
  background: #ebe6ff;
  color: #3f2c80;
}

.fishing-page__result-panel {
  border: 1px solid #98a4b4;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 10px;
}

.fishing-page__result-panel--success {
  border-color: #187a45;
}

.fishing-page__result-panel--fail {
  border-color: #b12f2f;
}

.fishing-page__catch-card {
  align-items: center;
  border: 1px solid #c8d2df;
  border-radius: 10px;
  display: grid;
  gap: 10px;
  grid-template-columns: 160px 1fr;
  margin: 10px 0;
  padding: 10px;
}

.fishing-page__catch-image {
  background: #f2f6fb;
  border: 1px solid #c6d1de;
  border-radius: 8px;
  display: block;
  aspect-ratio: 16 / 9;
  height: auto;
  object-fit: cover;
  width: 160px;
}

.fishing-page__catch-details h3 {
  font-size: 16px;
  margin-bottom: 6px;
}

.fishing-page__catch-row {
  font-size: 13px;
  margin: 2px 0;
}

.fishing-page__play-area {
  user-select: none;
}

.fishing-page__minigame-hud {
  margin-top: 10px;
}

.fishing-page__bar {
  background: #1f2f44;
  border-radius: 8px;
  height: 16px;
  overflow: hidden;
  position: relative;
}

.fishing-page__bar-fill {
  height: 100%;
}

.fishing-page__bar-fill--green {
  background: #20a05b;
}

.fishing-page__bar-marker {
  border-left: 2px solid #d52929;
  bottom: 0;
  position: absolute;
  top: 0;
  transform: translateX(-1px);
}

.fishing-page__bar-marker--red {
  border-left-color: #d52929;
}

.fishing-page__bar-marker--barrier {
  border-left: 2px dashed #d7e0ef;
}

.fishing-page__bar-marker--barrier-active {
  border-left-color: #ffb020;
}

.fishing-page a:focus-visible {
  outline: 3px solid #0b57d0;
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .fishing-page__layout {
    grid-template-columns: 1fr;
  }

  .fishing-page__panel,
  .fishing-page__scene {
    min-height: 0;
  }
}

@media (max-width: 600px) {
  .fishing-page {
    padding: 12px;
  }

  .fishing-page__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .fishing-page__cast-row {
    gap: 8px;
  }

  .fishing-page__phase-chip {
    font-size: 12px;
  }

  .fishing-page__minigame-hud {
    font-size: 14px;
  }

  .fishing-page__catch-card {
    grid-template-columns: 1fr;
  }

  .fishing-page__catch-image {
    aspect-ratio: 16 / 9;
    height: auto;
    width: 100%;
  }
}
</style>
