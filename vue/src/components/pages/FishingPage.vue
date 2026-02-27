<template>
  <section class="fishing-page">
    <header class="fishing-page__header">
      <h1>Fishing Game</h1>
      <RouterLink :to="{ name: $routes.INDEX }">Back to Index</RouterLink>
    </header>

    <main class="fishing-page__layout">
      <aside class="fishing-page__panel">
        <h2>Locations</h2>
        <p>WIP: location selector with reservoir list and active selection.</p>
        <ul class="fishing-page__location-list">
          <li v-for="location in locations" :key="location.id">
            <button
              class="fishing-page__location-button"
              :class="{
                'fishing-page__location-button--active':
                  selectedLocationId === location.id,
              }"
              @click="() => selectLocation(location.id)"
            >
              {{ location.name }}
            </button>
          </li>
        </ul>
      </aside>

      <section class="fishing-page__scene">
        <h2>Scene</h2>
        <p>
          WIP: fake-3D scene layers for background, rod poses, bobber, and line.
        </p>
        <div class="fishing-page__actions">
          <button @click="() => startMockCast()">Mock cast</button>
          <button @click="() => enterPhase('minigame')">
            Set minigame phase
          </button>
          <button @click="() => increaseMockProgress()">Mock reel tick</button>
          <button @click="() => mockCatch()">Mock catch</button>
          <button @click="() => mockFail()">Mock fail</button>
          <button @click="() => resetMockState()">Reset all mock state</button>
        </div>
      </section>

      <aside class="fishing-page__panel">
        <h2>Status</h2>
        <p>WIP: runtime fishing state and catch minigame HUD.</p>
        <p>Current phase: {{ phase }}</p>
        <p>Selected location: {{ selectedLocationName }}</p>
        <p>Session active location: {{ activeLocationId || 'none' }}</p>
        <p>
          Minigame progress: G {{ minigame.greenProgress.toFixed(2) }} / R
          {{ minigame.redProgress.toFixed(2) }}
        </p>
        <p>Attempts: {{ stats.attempts }}</p>
        <p>Catches: {{ stats.catches }}</p>
        <p>Fails: {{ stats.fails }}</p>
        <p>Catch rate: {{ catchRate }}</p>

        <div v-if="resultPanel.isOpen" class="fishing-page__status-card">
          <h3>Result Panel</h3>
          <p>{{ resultPanel.message }}</p>
          <button @click="() => hideResultPanel()">Close result panel</button>
        </div>

        <div class="fishing-page__status-card">
          <h3>Recent Log</h3>
          <p v-if="catchLog.length === 0">No results yet.</p>
          <ul v-else class="fishing-page__simple-list">
            <li v-for="item in recentCatchLog" :key="item.timestamp">
              {{ item.result }} | {{ item.locationId || 'unknown location' }} |
              {{ item.fishName || 'unknown fish' }}
            </li>
          </ul>
        </div>

        <div class="fishing-page__status-card">
          <h3>Notifications</h3>
          <button @click="() => clearNotifications()">
            Clear notifications
          </button>
          <p v-if="notifications.length === 0">No notifications.</p>
          <ul v-else class="fishing-page__simple-list">
            <li v-for="item in notifications" :key="item.id">
              {{ item.type }}: {{ item.message }}
              <button @click="() => removeNotification(item.id)">x</button>
            </li>
          </ul>
        </div>
      </aside>
    </main>
  </section>
</template>

<script>
export default {
  name: 'FishingPage',
  computed: {
    locations() {
      return this.$store.getters['content/getLocations'];
    },
    phase() {
      return this.$store.getters['gameSession/getPhase'];
    },
    activeLocationId() {
      return this.$store.getters['gameSession/getActiveLocationId'];
    },
    minigame() {
      return this.$store.getters['gameSession/getMinigameState'];
    },
    selectedLocationId() {
      return this.$store.getters['progress/getSelectedLocationId'];
    },
    selectedLocationName() {
      if (!this.selectedLocationId) {
        return 'none';
      }

      const location = this.$store.getters['content/getLocationById'](
        this.selectedLocationId,
      );
      return location ? location.name : 'unknown';
    },
    stats() {
      return this.$store.getters['progress/getStats'];
    },
    catchRate() {
      return this.$store.getters['progress/getCatchRate'];
    },
    catchLog() {
      return this.$store.getters['progress/getCatchLog'];
    },
    recentCatchLog() {
      return this.catchLog.slice(0, 3);
    },
    resultPanel() {
      return this.$store.getters['ui/getResultPanel'];
    },
    notifications() {
      return this.$store.getters['ui/getNotifications'];
    },
  },
  methods: {
    selectLocation(locationId) {
      this.$store.dispatch('progress/selectLocation', locationId);
      const location =
        this.$store.getters['content/getLocationById'](locationId);
      const locationName = location ? location.name : locationId;
      this.$store.dispatch('ui/pushNotification', {
        type: 'info',
        message: `Selected location: ${locationName}`,
      });
    },
    startMockCast() {
      if (!this.selectedLocationId) {
        this.$store.dispatch('ui/pushNotification', {
          type: 'warning',
          message: 'Select location before casting.',
        });
        return;
      }

      this.$store.dispatch('gameSession/startCast');
      this.$store.dispatch('ui/pushNotification', {
        type: 'info',
        message: 'Mock cast started.',
      });
    },
    enterPhase(phase) {
      this.$store.dispatch('gameSession/enterPhase', phase);
      this.$store.dispatch('ui/pushNotification', {
        type: 'info',
        message: `Phase set to ${phase}.`,
      });
    },
    increaseMockProgress() {
      const nextGreen = Math.min(this.minigame.greenProgress + 0.15, 1);
      const nextRed = Math.min(this.minigame.redProgress + 0.07, 1);

      this.$store.dispatch('gameSession/setMinigameState', {
        greenProgress: nextGreen,
        redProgress: nextRed,
        isReeling: true,
      });
    },
    mockCatch() {
      if (!this.selectedLocationId) {
        this.$store.dispatch('ui/pushNotification', {
          type: 'warning',
          message: 'Select location before logging result.',
        });
        return;
      }

      this.$store.dispatch('progress/recordCatch', {
        locationId: this.selectedLocationId,
        fishId: 'mock-fish',
        fishName: 'Mock Perch',
      });
      this.$store.dispatch('gameSession/setResult', {
        type: 'caught',
      });
    },
    mockFail() {
      if (!this.selectedLocationId) {
        this.$store.dispatch('ui/pushNotification', {
          type: 'warning',
          message: 'Select location before logging result.',
        });
        return;
      }

      this.$store.dispatch('progress/recordFail', {
        locationId: this.selectedLocationId,
        fishId: 'mock-fish',
        fishName: 'Mock Perch',
      });
      this.$store.dispatch('gameSession/setResult', {
        type: 'failed',
      });
    },
    hideResultPanel() {
      this.$store.dispatch('ui/hideResultPanel');
    },
    removeNotification(id) {
      this.$store.dispatch('ui/removeNotification', id);
    },
    clearNotifications() {
      this.$store.dispatch('ui/clearNotifications');
    },
    resetMockState() {
      this.$store.dispatch('gameSession/resetSession');
      this.$store.dispatch('progress/resetProgress');
      this.$store.dispatch('ui/hideResultPanel');
      this.$store.dispatch('ui/clearNotifications');
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
  border: 1px solid #ccc;
  border-radius: 8px;
  min-height: 240px;
  padding: 12px;
}

.fishing-page__location-list {
  list-style: none;
  margin: 8px 0 0;
  padding-left: 0;
}

.fishing-page__location-button {
  margin-bottom: 8px;
  width: 100%;
}

.fishing-page__location-button--active {
  border: 2px solid #1d8f4e;
}

.fishing-page__actions {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr;
}

.fishing-page__simple-list {
  margin: 8px 0 0;
  padding-left: 18px;
}

.fishing-page__status-card {
  border-top: 1px solid #ddd;
  margin-top: 12px;
  padding-top: 10px;
}

@media (max-width: 900px) {
  .fishing-page__layout {
    grid-template-columns: 1fr;
  }
}
</style>
