<template>
  <section class="fishing-page">
    <header class="fishing-page__header">
      <h1>Gone Fishing</h1>
      <RouterLink :to="{ name: $routes.INDEX }">Back to Index</RouterLink>
    </header>

    <main class="fishing-page__stage">
      <div
        class="fishing-page__play-area"
        @pointercancel="() => onReelingStop()"
        @pointerdown="() => onReelingStart()"
        @pointerleave="() => onReelingStop()"
        @pointerup="() => onReelingStop()"
      >
        <FishingScene
          :bobber="sceneBobber"
          :groundbait-area="activeGroundbaitArea"
          :location="selectedLocation"
          :show-landing-net-badge="showLandingNetBadge"
          @cast="(castAnchor) => onSceneCast(castAnchor)"
        />
      </div>

      <CollapsibleSidebar
        class="fishing-page__hud-panel fishing-page__hud-panel--left"
        :collapsed="isLocationPanelCollapsed"
        direction="left"
        mobile-mode="force-expanded"
        :mobile-breakpoint="900"
        :peek-size="48"
        :collapsed-min-height="72"
        @toggle="(nextCollapsed) => toggleLocationPanel(nextCollapsed)"
      >
        <h2 class="fishing-page__panel-title">Locations</h2>
        <p class="fishing-page__panel-copy">Choose the next water to fish.</p>
        <LocationSelector
          :boosted-casts-remaining="boostedCastsRemaining"
          :boosted-location-id="boostedLocationId"
          :disabled="!canCast"
          :locations="locations"
          :selected-location-id="selectedLocationId"
          @select="(locationId) => selectLocation(locationId)"
        />
      </CollapsibleSidebar>

      <CollapsibleSidebar
        class="fishing-page__hud-panel fishing-page__hud-panel--right"
        :collapsed="isStatusPanelCollapsed"
        direction="right"
        mobile-mode="force-expanded"
        :mobile-breakpoint="900"
        :peek-size="48"
        :collapsed-min-height="72"
        @toggle="(nextCollapsed) => toggleStatusPanel(nextCollapsed)"
      >
        <h2 class="fishing-page__panel-title">Status</h2>
        <p class="fishing-page__panel-copy">Current fishing session state.</p>
        <dl class="fishing-page__status-list">
          <div class="fishing-page__status-row">
            <dt>Phase</dt>
            <dd>{{ phase }}</dd>
          </div>
          <div class="fishing-page__status-row">
            <dt>Location</dt>
            <dd>{{ selectedLocationName }}</dd>
          </div>
          <div class="fishing-page__status-row">
            <dt>Cast started</dt>
            <dd>{{ castStartedAtLabel }}</dd>
          </div>
          <div class="fishing-page__status-row">
            <dt>Encounter</dt>
            <dd>{{ encounterLabel }}</dd>
          </div>
          <div class="fishing-page__status-row">
            <dt>Reeling</dt>
            <dd>{{ isReeling ? 'yes' : 'no' }}</dd>
          </div>
          <div class="fishing-page__status-row">
            <dt>Barrier</dt>
            <dd>{{ isBarrierBlocking ? 'blocked' : 'clear' }}</dd>
          </div>
          <div class="fishing-page__status-row">
            <dt>Rod</dt>
            <dd>{{ equippedRodName }}</dd>
          </div>
          <div class="fishing-page__status-row">
            <dt>Line</dt>
            <dd>{{ equippedLineName }}</dd>
          </div>
          <div class="fishing-page__status-row">
            <dt>Bait</dt>
            <dd>{{ equippedBaitName }}</dd>
          </div>
          <div class="fishing-page__status-row">
            <dt>Landing net</dt>
            <dd>{{ equippedLandingNetName }}</dd>
          </div>
        </dl>
        <section
          v-if="sceneWarnings.length"
          class="fishing-page__warning-panel"
        >
          <h3 class="fishing-page__warning-title">Scene warnings</h3>
          <ul class="fishing-page__warning-list">
            <li v-for="warning in sceneWarnings" :key="warning">
              {{ warning }}
            </li>
          </ul>
        </section>
      </CollapsibleSidebar>

      <CollapsibleSidebar
        v-if="hasAnyGroundbaitAvailable"
        class="fishing-page__hud-panel fishing-page__hud-panel--left fishing-page__groundbait-panel"
        :collapsed="isGroundbaitPanelCollapsed"
        direction="left"
        mobile-mode="force-expanded"
        :mobile-breakpoint="900"
        :peek-size="48"
        :collapsed-min-height="72"
        @toggle="(nextCollapsed) => toggleGroundbaitPanel(nextCollapsed)"
      >
        <h2 class="fishing-page__panel-title">Groundbait</h2>
        <p class="fishing-page__panel-copy">
          Select mix and click water to deploy.
        </p>
        <div class="fishing-page__groundbait-list">
          <button
            v-for="groundbait in availableGroundbaitItems"
            :key="groundbait.id"
            class="fishing-page__groundbait-item"
            :class="{
              'fishing-page__groundbait-item--active':
                groundbait.id === effectiveSelectedGroundbaitId,
            }"
            type="button"
            @click="() => selectGroundbait(groundbait.id)"
          >
            <span>{{ groundbait.name }}</span>
            <span>x{{ groundbait.count }}</span>
          </button>
        </div>
        <BaseButton
          :disabled="!canArmGroundbait"
          @click="() => toggleGroundbaitArmed()"
        >
          {{ isGroundbaitArmed ? 'Cancel Groundbait' : 'Throw Groundbait' }}
        </BaseButton>
      </CollapsibleSidebar>

      <section class="fishing-page__hud-tray">
        <div class="fishing-page__tray-primary">
          <div class="fishing-page__cast-row">
            <span
              class="fishing-page__phase-chip"
              :class="`fishing-page__phase-chip--${phase}`"
              role="status"
            >
              {{ phaseMessage }}
            </span>
          </div>
          <p class="fishing-page__cast-hint">
            {{ castHintText }}
          </p>
        </div>

        <section v-if="phase === 'minigame'" class="fishing-page__minigame-hud">
          <p v-if="isBarrierBlocking" class="fishing-page__minigame-copy">
            Mash left mouse button or Q to break barrier.
          </p>
          <p v-else class="fishing-page__minigame-copy">
            Hold left mouse button or Space to reel.
          </p>
          <div class="fishing-page__bar" role="img">
            <div
              class="fishing-page__bar-fill fishing-page__bar-fill--green"
              :style="{ width: `${greenProgressStylePercent}%` }"
            ></div>
            <div
              class="fishing-page__bar-marker fishing-page__bar-marker--red"
              :style="{ left: `${redProgressStylePercent}%` }"
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
          <div class="fishing-page__durability">
            <span class="fishing-page__durability-label">Rod durability</span>
            <div class="fishing-page__durability-track" role="img">
              <div
                class="fishing-page__durability-fill"
                :style="{ width: `${durabilityWearStylePercent}%` }"
              ></div>
            </div>
            <span class="fishing-page__durability-value">
              {{ durabilityWearPercent }}%
            </span>
          </div>
          <p v-if="isBarrierBlocking" class="fishing-page__minigame-copy">
            Clicks remaining: {{ barrierRemainingClicks }}
          </p>
        </section>

        <section
          v-if="resultPanel.isOpen"
          class="fishing-page__result-panel"
          :class="{
            'fishing-page__result-panel--success': resultPanel.isSuccess,
            'fishing-page__result-panel--fail': !resultPanel.isSuccess,
          }"
        >
          <div class="fishing-page__result-head">
            <p class="fishing-page__result-message">
              {{ resultPanel.message }}
            </p>
            <BaseButton @click="() => closeResultPanel()">Close</BaseButton>
          </div>
          <article v-if="showCatchCard" class="fishing-page__catch-card">
            <div class="fishing-page__catch-media">
              <img
                class="fishing-page__catch-image"
                :src="catchImageSrc"
                :alt="`${resultEncounter.fishName} illustration`"
                width="1536"
                height="1024"
              />
            </div>
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
        </section>
      </section>

      <BaseButton
        class="fishing-page__inventory-launcher"
        :disabled="!canOpenInventoryOverlay"
        @click="() => openInventoryOverlay()"
      >
        Inventory
      </BaseButton>

      <InventoryStoreOverlay
        :active-tab="inventoryOverlayTab"
        :inventory-fish="inventoryFish"
        :inventory-gear-items="inventoryGearItems"
        :is-open="isInventoryOverlayOpen"
        :money="money"
        :mode="inventoryOverlayMode"
        :store-gear-items="storeGearItems"
        @buy-item="(item) => onInventoryBuyItem(item)"
        @close="() => closeInventoryOverlay()"
        @equip-item="(item) => onInventoryEquipItem(item)"
        @mode-change="(mode) => setInventoryOverlayMode(mode)"
        @sell-all-fish="() => onInventorySellAllFish()"
        @sell-item="(item) => onInventorySellItem(item)"
        @tab-change="(tabId) => setInventoryOverlayTab(tabId)"
      />
    </main>
  </section>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import CollapsibleSidebar from '@/components/ui/CollapsibleSidebar.vue'
import FishingScene from '@/components/fishing/FishingScene.vue'
import InventoryStoreOverlay from '@/components/ui/InventoryStoreOverlay.vue'
import LocationSelector from '@/components/fishing/LocationSelector.vue'
import { defineConfig } from '@/utils/defineConfig'
import { mapActions, mapGetters } from 'vuex'

const DEFAULT_PAGE_TITLE = 'Fishing Game'
const HOOKED_BOBBER_Y = 92
const PHASE_PAGE_TITLES = defineConfig({
  idle: 'Looking for fish...',
  waitingBite: 'Patiently waiting...',
  minigame: '3..2..1.. FIGHT!',
  result: 'Another one!',
})

export default {
  name: 'FishingPage',
  components: {
    BaseButton,
    CollapsibleSidebar,
    FishingScene,
    InventoryStoreOverlay,
    LocationSelector,
  },
  data() {
    return {
      unsubscribePhaseSubscription: null,
      lastAppliedPhase: null,
      isLocationPanelCollapsed: false,
      isStatusPanelCollapsed: false,
      isGroundbaitPanelCollapsed: false,
      isInventoryOverlayOpen: false,
      inventoryOverlayMode: 'inventory',
      inventoryOverlayTab: 'fish',
      selectedGroundbaitId: null,
      isGroundbaitArmed: false,
    }
  },
  computed: {
    ...mapGetters('content', {
      locations: 'getLocations',
      configWarnings: 'getConfigWarnings',
      gearDefinitions: 'getGearDefinitions',
      groundbaitDefinitions: 'getGroundbaitDefinitions',
      landingNetDefinitions: 'getLandingNetDefinitions',
      fishDefinitions: 'getFishDefinitions',
      getLocationWarnings: 'getLocationWarnings',
      getLocationById: 'getLocationById',
    }),
    ...mapGetters('progress', {
      money: 'getMoney',
      inventoryFish: 'getInventoryFish',
      boostedLocationId: 'getBoostedLocationId',
      boostedCastsRemaining: 'getBoostedCastsRemaining',
      inventoryRods: 'getInventoryRods',
      inventoryLines: 'getInventoryLines',
      inventoryBait: 'getInventoryBait',
      inventoryGroundbait: 'getInventoryGroundbait',
      inventoryLandingNets: 'getInventoryLandingNets',
      currentRodId: 'getCurrentRodId',
      currentLineId: 'getCurrentLineId',
      currentBaitId: 'getCurrentBaitId',
      currentLandingNetId: 'getCurrentLandingNetId',
      equippedLandingNet: 'getEquippedLandingNet',
      selectedLocationId: 'getSelectedLocationId',
    }),
    ...mapGetters('gameSession', {
      phase: 'getPhase',
      castAnchor: 'getCastAnchor',
      castStartedAt: 'getCastStartedAt',
      encounter: 'getEncounter',
      result: 'getResult',
      minigameState: 'getMinigameState',
      activeBarrier: 'getActiveBarrier',
      barrierRemainingClicks: 'getBarrierRemainingClicks',
      isBarrierBlocking: 'getIsBarrierBlocking',
      getGroundbaitAreaByLocation: 'getGroundbaitAreaByLocation',
    }),
    ...mapGetters('ui', {
      resultPanel: 'getResultPanel',
    }),
    inventoryGearItems() {
      return {
        rods: this.buildInventoryGearRows('rods'),
        lines: this.buildInventoryGearRows('lines'),
        bait: this.buildInventoryGearRows('bait'),
        landingNets: this.buildInventoryLandingNetRows(),
        groundbait: this.buildInventoryGroundbaitRows(),
      }
    },
    storeGearItems() {
      return {
        rods: this.buildStoreGearRows('rods'),
        lines: this.buildStoreGearRows('lines'),
        bait: this.buildStoreGearRows('bait'),
        landingNets: this.buildStoreLandingNetRows(),
        groundbait: this.buildStoreGroundbaitRows(),
      }
    },
    availableGroundbaitItems() {
      const definitions = this.groundbaitDefinitions || []
      return definitions
        .map((item) => ({
          id: item.id,
          name: item.name,
          count: Number(this.inventoryGroundbait?.[item.id] || 0),
        }))
        .filter((item) => item.count > 0)
    },
    hasAnyGroundbaitAvailable() {
      return this.availableGroundbaitItems.length > 0
    },
    effectiveSelectedGroundbaitId() {
      const selectedExists = this.availableGroundbaitItems.some(
        (item) => item.id === this.selectedGroundbaitId,
      )
      if (selectedExists) {
        return this.selectedGroundbaitId
      }

      return this.availableGroundbaitItems[0]?.id || null
    },
    selectedGroundbait() {
      if (!this.effectiveSelectedGroundbaitId) {
        return null
      }

      return (
        (this.groundbaitDefinitions || []).find(
          (item) => item.id === this.effectiveSelectedGroundbaitId,
        ) || null
      )
    },
    canArmGroundbait() {
      return this.canCast && Boolean(this.effectiveSelectedGroundbaitId)
    },
    activeGroundbaitArea() {
      if (!this.selectedLocationId) {
        return null
      }

      return this.getGroundbaitAreaByLocation(this.selectedLocationId)
    },
    selectedLocationWarnings() {
      const locationId =
        this.selectedLocationId || this.selectedLocation?.id || null

      if (!locationId) {
        return []
      }

      return this.getLocationWarnings(locationId)
    },
    sceneWarnings() {
      return [
        ...new Set([...this.configWarnings, ...this.selectedLocationWarnings]),
      ]
    },
    phaseMessage() {
      if (this.phase === 'waitingBite') {
        return 'Waiting for bite...'
      }

      if (this.phase === 'minigame') {
        return 'Fish bite detected.'
      }

      if (this.phase === 'result') {
        return `Result: ${this.resultLabel}`
      }

      return 'Ready to cast.'
    },
    canCast() {
      return this.phase === 'idle' || this.phase === 'result'
    },
    castHintText() {
      if (this.isGroundbaitArmed && this.selectedGroundbait) {
        return `Groundbait mode: click water to throw ${this.selectedGroundbait.name}.`
      }

      return 'Click anywhere on the water to cast.'
    },
    canOpenInventoryOverlay() {
      return this.phase === 'idle' || this.phase === 'result'
    },
    canUseLandingNetNow() {
      if (this.phase !== 'minigame') {
        return false
      }

      if (!this.equippedLandingNet) {
        return false
      }

      const greenProgress = Number(this.minigameState.greenProgress || 0)
      return greenProgress >= 0.825
    },
    showLandingNetBadge() {
      return this.canUseLandingNetNow
    },
    sceneBobber() {
      if (!this.selectedLocation) {
        return {
          isVisible: false,
        }
      }

      const defaultAnchor = this.selectedLocation.bobberAnchor
      const anchorPosition = this.castAnchor || defaultAnchor
      if (
        !anchorPosition ||
        !Number.isFinite(anchorPosition.x) ||
        !Number.isFinite(anchorPosition.y)
      ) {
        return {
          isVisible: false,
        }
      }

      const targetPosition = {
        x: 50,
        y: HOOKED_BOBBER_Y,
      }

      if (this.phase === 'casting' || this.phase === 'waitingBite') {
        return {
          isVisible: true,
          isEnergized: true,
          mode: 'waiting',
          anchorPosition,
          progress: 0,
          targetPosition,
        }
      }

      if (this.phase === 'minigame') {
        return {
          isVisible: true,
          isEnergized: this.isReeling,
          mode: 'hooked',
          anchorPosition,
          progress: this.minigameState.greenProgress || 0,
          targetPosition,
        }
      }

      return {
        isVisible: false,
      }
    },
    castStartedAtLabel() {
      if (!this.castStartedAt) {
        return 'n/a'
      }

      return new Date(this.castStartedAt).toLocaleTimeString()
    },
    resultEncounter() {
      return this.result?.encounter || null
    },
    showCatchCard() {
      return Boolean(
        this.resultPanel.isOpen &&
        this.resultPanel.isSuccess &&
        this.resultEncounter,
      )
    },
    catchImageSrc() {
      if (!this.resultEncounter) {
        return ''
      }

      return `/images/fish/${this.resultEncounter.fishId}.webp`
    },
    catchSizeLabel() {
      if (!this.resultEncounter) {
        return 'n/a'
      }

      return `${Number(this.resultEncounter.size || 0).toFixed(2)} kg`
    },
    catchQualityLabel() {
      if (!this.resultEncounter) {
        return 'n/a'
      }

      return Number(this.resultEncounter.quality || 0).toFixed(2)
    },
    catchDifficultyLabel() {
      if (!this.resultEncounter) {
        return 'n/a'
      }

      return Number(this.resultEncounter.difficultyScore || 0).toFixed(2)
    },
    resultLabel() {
      if (!this.result) {
        return 'none'
      }

      if (this.result.status === 'success') {
        return 'success'
      }

      return 'fail'
    },
    encounterLabel() {
      if (!this.encounter) {
        return 'none'
      }

      return `${this.encounter.fishName} (tier ${this.encounter.tier}, diff ${this.encounter.difficultyScore})`
    },
    selectedLocation() {
      if (!this.selectedLocationId) {
        return this.locations[0] || null
      }

      return this.getLocationById(this.selectedLocationId)
    },
    selectedLocationName() {
      return this.selectedLocation?.name || 'none'
    },
    equippedRodName() {
      return this.resolveGearName('rods', this.currentRodId)
    },
    equippedLineName() {
      return this.resolveGearName('lines', this.currentLineId)
    },
    equippedBaitName() {
      return this.resolveGearName('bait', this.currentBaitId)
    },
    equippedLandingNetName() {
      return this.equippedLandingNet?.name || 'none'
    },
    minigameBarriers() {
      return this.minigameState.config?.barriers || []
    },
    isReeling() {
      return Boolean(this.minigameState.isReeling)
    },
    durabilityWear() {
      return Number(this.minigameState.durabilityWear || 0)
    },
    durabilityWearStylePercent() {
      return Number((this.durabilityWear * 100).toFixed(3))
    },
    durabilityWearPercent() {
      return Math.round(this.durabilityWear * 100)
    },
    greenProgressStylePercent() {
      return Number(((this.minigameState.greenProgress || 0) * 100).toFixed(3))
    },
    redProgressStylePercent() {
      return Number(((this.minigameState.redProgress || 0) * 100).toFixed(3))
    },
    elapsedMsLabel() {
      return `${Math.round(this.minigameState.elapsedMs || 0)}ms`
    },
    maxTimeLabel() {
      const maxMs = this.minigameState.config?.maxTimeMs || 0
      return `${maxMs}ms`
    },
  },
  mounted() {
    window.addEventListener('pointerup', this.onReelingStop)
    window.addEventListener('blur', this.onReelingStop)
    window.addEventListener('keydown', this.onWindowKeyDown)
    window.addEventListener('keyup', this.onWindowKeyUp)
  },
  beforeUnmount() {
    window.removeEventListener('pointerup', this.onReelingStop)
    window.removeEventListener('blur', this.onReelingStop)
    window.removeEventListener('keydown', this.onWindowKeyDown)
    window.removeEventListener('keyup', this.onWindowKeyUp)

    if (this.unsubscribePhaseSubscription) {
      this.unsubscribePhaseSubscription()
      this.unsubscribePhaseSubscription = null
    }

    this.applyPageTitle()
  },
  created() {
    this.lastAppliedPhase = this.phase
    if (!this.selectedLocationId && this.locations.length) {
      this.selectLocation(this.locations[0].id)
    }

    this.applyPageTitle(this.lastAppliedPhase)
    this.unsubscribePhaseSubscription = this.$store.subscribe((mutation) => {
      if (!mutation.type.startsWith('gameSession/')) {
        return
      }

      const nextPhase = this.phase
      if (nextPhase === this.lastAppliedPhase) {
        return
      }

      this.lastAppliedPhase = nextPhase
      this.applyPageTitle(nextPhase)
    })
  },
  methods: {
    ...mapActions('progress', {
      dispatchSellFishByInstanceId: 'sellFishByInstanceId',
      dispatchSellAllFish: 'sellAllFish',
      dispatchBuyLandingNetItem: 'buyLandingNetItem',
      dispatchBuyGroundbaitItem: 'buyGroundbaitItem',
      dispatchBuyGearItem: 'buyGearItem',
      dispatchEquipLandingNetItem: 'equipLandingNetItem',
      dispatchEquipGearItem: 'equipGearItem',
      dispatchSelectLocation: 'selectLocation',
    }),
    ...mapActions('gameSession', {
      dispatchStartCast: 'startCast',
      dispatchThrowGroundbait: 'throwGroundbait',
      dispatchAttemptLandingNetCatch: 'attemptLandingNetCatch',
      dispatchSetReeling: 'setReeling',
      dispatchRegisterBarrierClick: 'registerBarrierClick',
    }),
    ...mapActions('ui', {
      dispatchHideResultPanel: 'hideResultPanel',
    }),
    resolvePageTitle(phase) {
      return PHASE_PAGE_TITLES[phase] || DEFAULT_PAGE_TITLE
    },
    toggleLocationPanel(nextCollapsed) {
      if (typeof nextCollapsed === 'boolean') {
        this.isLocationPanelCollapsed = nextCollapsed
        return
      }

      this.isLocationPanelCollapsed = !this.isLocationPanelCollapsed
    },
    toggleStatusPanel(nextCollapsed) {
      if (typeof nextCollapsed === 'boolean') {
        this.isStatusPanelCollapsed = nextCollapsed
        return
      }

      this.isStatusPanelCollapsed = !this.isStatusPanelCollapsed
    },
    toggleGroundbaitPanel(nextCollapsed) {
      if (typeof nextCollapsed === 'boolean') {
        this.isGroundbaitPanelCollapsed = nextCollapsed
        return
      }

      this.isGroundbaitPanelCollapsed = !this.isGroundbaitPanelCollapsed
    },
    selectGroundbait(groundbaitId) {
      this.selectedGroundbaitId = groundbaitId
    },
    toggleGroundbaitArmed() {
      if (!this.canArmGroundbait) {
        this.isGroundbaitArmed = false
        return
      }

      this.isGroundbaitArmed = !this.isGroundbaitArmed
    },
    openInventoryOverlay() {
      if (!this.canOpenInventoryOverlay) {
        return
      }

      this.inventoryOverlayMode = 'inventory'
      this.inventoryOverlayTab = 'fish'
      this.isInventoryOverlayOpen = true
    },
    closeInventoryOverlay() {
      this.isInventoryOverlayOpen = false
    },
    setInventoryOverlayMode(mode) {
      this.inventoryOverlayMode = mode

      if (mode === 'store' && this.inventoryOverlayTab === 'fish') {
        this.inventoryOverlayTab = 'rods'
      }
    },
    setInventoryOverlayTab(tabId) {
      this.inventoryOverlayTab = tabId
    },
    onInventorySellItem(item) {
      if (!item?.id) {
        return Promise.resolve(false)
      }

      return this.dispatchSellFishByInstanceId(item.id)
    },
    onInventorySellAllFish() {
      return this.dispatchSellAllFish()
    },
    onInventoryBuyItem(item) {
      if (!item?.id || !item?.slot) {
        return Promise.resolve(false)
      }

      const specialBuyHandlers = {
        landingNets: () => this.dispatchBuyLandingNetItem(item.id),
        groundbait: () => this.dispatchBuyGroundbaitItem(item.id),
      }

      const specialHandler = specialBuyHandlers[item.slot]
      if (specialHandler) {
        return specialHandler()
      }

      return this.dispatchBuyGearItem({
        slot: item.slot,
        itemId: item.id,
      })
    },
    onInventoryEquipItem(item) {
      if (!item?.id || !item?.slot) {
        return Promise.resolve(false)
      }

      const specialEquipHandlers = {
        landingNets: () => this.dispatchEquipLandingNetItem(item.id),
      }

      const specialHandler = specialEquipHandlers[item.slot]
      if (specialHandler) {
        return specialHandler()
      }

      return this.dispatchEquipGearItem({
        slot: item.slot,
        itemId: item.id,
      })
    },
    resolveGearName(slot, gearId) {
      const items = this.gearDefinitions?.[slot]
      if (!Array.isArray(items)) {
        return 'n/a'
      }

      const found = items.find((item) => item.id === gearId)
      return found?.name || 'n/a'
    },
    resolveFishName(fishId) {
      if (!Array.isArray(this.fishDefinitions)) {
        return fishId
      }

      const fish = this.fishDefinitions.find((entry) => entry.id === fishId)
      return fish?.name || fishId
    },
    getOwnedCount(slot, gearItem) {
      if (gearItem.isUnlimited) {
        return Number.POSITIVE_INFINITY
      }

      if (slot === 'rods') {
        return Number(this.inventoryRods?.[gearItem.id] || 0)
      }

      if (slot === 'lines') {
        return Number(this.inventoryLines?.[gearItem.id] || 0)
      }

      return Number(this.inventoryBait?.[gearItem.id] || 0)
    },
    getEquippedId(slot) {
      if (slot === 'rods') {
        return this.currentRodId
      }

      if (slot === 'lines') {
        return this.currentLineId
      }

      return this.currentBaitId
    },
    resolveGearImageSrc(slot, itemId) {
      if (slot !== 'rods') {
        return null
      }

      const rodImageById = {
        spinning: '/images/rods/rod-spinning.png',
        fly: '/images/rods/rod-flywheel.png',
        baitcast: '/images/rods/rod-baitcast.png',
      }

      return rodImageById[itemId] || null
    },
    resolveLandingNetImageSrc(itemId) {
      const landingNetImageById = {
        'landing-net-small': '/images/nets/net-default.png',
        'landing-net-big': '/images/nets/net-square.png',
      }

      return landingNetImageById[itemId] || null
    },
    buildInventoryGearRows(slot) {
      const items = this.gearDefinitions?.[slot]
      if (!Array.isArray(items)) {
        return []
      }

      const equippedId = this.getEquippedId(slot)

      return items.map((item) => {
        const ownedCount = this.getOwnedCount(slot, item)
        const isEquipped = item.id === equippedId
        return {
          id: item.id,
          slot,
          name: item.name,
          meta: item.isDefault ? 'Default loadout' : 'Purchased gear',
          ownedLabel: item.isUnlimited ? '∞' : String(ownedCount),
          isEquipped,
          canEquip: item.isUnlimited || ownedCount > 0,
          price: Number(item.price || 0),
          imageSrc: this.resolveGearImageSrc(slot, item.id),
        }
      })
    },
    buildStoreGearRows(slot) {
      const items = this.gearDefinitions?.[slot]
      if (!Array.isArray(items)) {
        return []
      }

      return items
        .filter((item) => !item.isDefault && !item.isUnlimited)
        .map((item) => ({
          id: item.id,
          slot,
          name: item.name,
          meta: 'Store item',
          price: Number(item.price || 0),
          canBuy: this.money >= Number(item.price || 0),
          imageSrc: this.resolveGearImageSrc(slot, item.id),
        }))
    },
    buildInventoryLandingNetRows() {
      return (this.landingNetDefinitions || []).map((item) => {
        const ownedCount = Number(this.inventoryLandingNets?.[item.id] || 0)
        const isEquipped = item.id === this.currentLandingNetId
        return {
          id: item.id,
          slot: 'landingNets',
          name: item.name,
          meta: `Capacity ${Number(item.capacityKg || 0).toFixed(2)} kg`,
          ownedLabel: String(ownedCount),
          isEquipped,
          canEquip: ownedCount > 0,
          price: Number(item.price || 0),
          imageSrc: this.resolveLandingNetImageSrc(item.id),
        }
      })
    },
    buildStoreLandingNetRows() {
      return (this.landingNetDefinitions || []).map((item) => ({
        id: item.id,
        slot: 'landingNets',
        name: item.name,
        meta: `Capacity ${Number(item.capacityKg || 0).toFixed(2)} kg`,
        price: Number(item.price || 0),
        canBuy: this.money >= Number(item.price || 0),
        imageSrc: this.resolveLandingNetImageSrc(item.id),
      }))
    },
    buildInventoryGroundbaitRows() {
      return (this.groundbaitDefinitions || []).map((item) => {
        const ownedCount = Number(this.inventoryGroundbait?.[item.id] || 0)
        return {
          id: item.id,
          slot: 'groundbait',
          name: item.name,
          meta: `Targets ${this.resolveFishName(item.targetFishId)}`,
          ownedLabel: String(ownedCount),
          isEquipped: false,
          canEquip: false,
          price: Number(item.price || 0),
          imageSrc: null,
        }
      })
    },
    buildStoreGroundbaitRows() {
      return (this.groundbaitDefinitions || []).map((item) => ({
        id: item.id,
        slot: 'groundbait',
        name: item.name,
        meta: `Targets ${this.resolveFishName(item.targetFishId)}`,
        price: Number(item.price || 0),
        canBuy: this.money >= Number(item.price || 0),
        imageSrc: null,
      }))
    },
    applyPageTitle(phase) {
      document.title = this.resolvePageTitle(phase)
    },
    selectLocation(locationId) {
      this.dispatchSelectLocation(locationId)
    },
    startCast(castAnchor = null) {
      this.dispatchStartCast({
        castAnchor,
      })
    },
    onSceneCast(castAnchor) {
      if (!this.canCast) {
        return Promise.resolve(false)
      }

      if (this.isGroundbaitArmed && this.effectiveSelectedGroundbaitId) {
        return this.dispatchThrowGroundbait({
          baitId: this.effectiveSelectedGroundbaitId,
          castAnchor,
        }).then((didThrow) => {
          if (!didThrow) {
            return false
          }

          this.isGroundbaitArmed = false
          return true
        })
      }

      return this.startCast(castAnchor).then(() => true)
    },
    isEditableTarget(target) {
      const element = target
      if (!element || typeof element.closest !== 'function') {
        return false
      }

      return Boolean(
        element.closest('input, textarea, select, [contenteditable="true"]'),
      )
    },
    onWindowKeyDown(event) {
      if (this.isEditableTarget(event.target)) {
        return
      }

      if (event.key?.toLowerCase() === 's') {
        if (this.phase !== 'minigame' || event.repeat) {
          return
        }

        event.preventDefault()
        this.dispatchAttemptLandingNetCatch()
        return
      }

      if (event.code === 'Space') {
        if (this.phase !== 'minigame') {
          return
        }

        event.preventDefault()
        if (this.isBarrierBlocking) {
          return
        }

        this.dispatchSetReeling(true)
        return
      }

      if (event.key?.toLowerCase() !== 'q') {
        return
      }

      if (
        this.phase !== 'minigame' ||
        !this.isBarrierBlocking ||
        event.repeat
      ) {
        return
      }

      event.preventDefault()
      this.dispatchRegisterBarrierClick()
    },
    onWindowKeyUp(event) {
      if (this.isEditableTarget(event.target)) {
        return
      }

      if (event.code !== 'Space') {
        return
      }

      if (this.phase !== 'minigame') {
        return
      }

      event.preventDefault()
      this.dispatchSetReeling(false)
    },
    onReelingStart() {
      if (this.phase !== 'minigame') {
        return
      }

      if (this.isBarrierBlocking) {
        this.dispatchRegisterBarrierClick()
        return
      }

      this.dispatchSetReeling(true)
    },
    onReelingStop() {
      if (this.phase !== 'minigame') {
        return
      }

      this.dispatchSetReeling(false)
    },
    closeResultPanel() {
      this.dispatchHideResultPanel()
    },
  },
}
</script>

<style scoped lang="scss">
@use 'sass:map';
@use '@/styles/mixins' as mixins;
@use '@/styles/tokens' as tokens;

.fishing-page {
  background: tokens.$fishing-page-background;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  padding: 16px;

  &__header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    h1 {
      color: #f5f8fc;
      margin: 0;
    }
  }

  &__stage {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    position: relative;
  }

  &__cast-row {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__cast-hint {
    color: tokens.$fishing-panel-text;
    font-size: clamp(16px, 1.6vw, 20px);
    font-weight: 600;
    line-height: 1.4;
    margin: 0;
    max-width: 38ch;
  }

  &__phase-chip {
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 10px;

    @each $phase, $phase-style in tokens.$fishing-phase-chip-styles {
      &--#{$phase} {
        background: map.get($phase-style, background);
        color: map.get($phase-style, color);
      }
    }
  }

  &__result-panel {
    background: tokens.$fishing-result-background;
    border: 1px solid tokens.$fishing-result-border;
    border-radius: tokens.$fishing-result-radius;
    padding: tokens.$fishing-result-padding;

    &--success {
      border-color: tokens.$fishing-result-border-success;
    }

    &--fail {
      border-color: tokens.$fishing-result-border-fail;
    }
  }

  &__play-area {
    height: 100%;
    inset: 0;
    min-height: 0;
    position: absolute;
    user-select: none;
    width: 100%;
  }

  &__hud-panel {
    @include mixins.glass-panel(
      tokens.$fishing-panel-background,
      tokens.$fishing-panel-border,
      tokens.$fishing-panel-radius,
      tokens.$fishing-panel-shadow,
      tokens.$fishing-panel-padding
    );
    color: tokens.$fishing-panel-text;
    max-height: calc(100% - 176px);
    overflow: auto;
    position: absolute;
    top: 16px;
    width: min(260px, calc(50% - 28px));
    z-index: 2;

    &--left {
      left: 16px;
    }

    &--right {
      right: 16px;
    }
  }

  &__groundbait-panel {
    bottom: 164px;
    max-height: calc(100% - 340px);
    top: auto;
  }

  &__panel-title {
    font-size: 13px;
    letter-spacing: 0.08em;
    margin: 0 0 8px;
    text-transform: uppercase;
  }

  &__panel-copy {
    color: tokens.$fishing-panel-muted;
    font-size: 13px;
    line-height: 1.4;
    margin: 0 0 14px;
  }

  &__status-list {
    display: grid;
    gap: 10px;
    margin: 0 0 16px;
  }

  &__status-row {
    border-bottom: 1px solid tokens.$fishing-status-border;
    display: grid;
    gap: 4px;
    padding-bottom: 10px;

    dt {
      color: tokens.$fishing-panel-muted;
      font-size: 12px;
      letter-spacing: 0.05em;
      margin: 0;
      text-transform: uppercase;
    }

    dd {
      margin: 0;
    }
  }

  &__warning-panel {
    @include mixins.warning-panel(
      tokens.$fishing-warning-background,
      tokens.$fishing-warning-border,
      tokens.$fishing-warning-text,
      tokens.$fishing-warning-radius,
      tokens.$fishing-warning-padding
    );
    margin-bottom: 14px;
  }

  &__warning-title {
    font-size: 13px;
    margin: 0 0 6px;
    text-transform: uppercase;
  }

  &__warning-list {
    margin: 0;
    padding-left: 18px;
  }

  &__groundbait-list {
    display: grid;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__groundbait-item {
    align-items: center;
    background: rgba(14, 28, 43, 0.66);
    border: 1px solid tokens.$fishing-panel-border;
    border-radius: 8px;
    color: tokens.$fishing-panel-text;
    cursor: pointer;
    display: flex;
    font-size: 13px;
    justify-content: space-between;
    padding: 8px 10px;
    width: 100%;

    &--active {
      border-color: #d7b15a;
      box-shadow: inset 0 0 0 1px #d7b15a;
    }
  }

  &__hud-tray {
    @include mixins.glass-panel(
      tokens.$fishing-tray-background,
      tokens.$fishing-tray-border,
      tokens.$fishing-tray-radius,
      tokens.$fishing-panel-shadow,
      tokens.$fishing-tray-padding,
      14px
    );
    bottom: 16px;
    color: tokens.$fishing-panel-text;
    display: grid;
    gap: 14px;
    left: 50%;
    max-width: min(1120px, calc(100% - 32px));
    position: absolute;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    z-index: 3;
  }

  &__inventory-launcher {
    bottom: 16px;
    position: fixed;
    right: 16px;
    z-index: 25;
  }

  &__tray-primary {
    align-items: start;
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    justify-content: space-between;
  }

  &__catch-card {
    align-items: center;
    border: 1px solid tokens.$fishing-catch-card-border;
    border-radius: tokens.$fishing-catch-card-radius;
    display: grid;
    gap: tokens.$fishing-catch-card-gap;
    grid-template-columns: tokens.$fishing-catch-card-width 1fr;
    margin: 10px 0;
    padding: tokens.$fishing-catch-card-padding;
  }

  &__catch-media {
    @include mixins.catch-frame(
      tokens.$fishing-catch-media-background,
      tokens.$fishing-catch-media-border,
      tokens.$fishing-catch-media-radius
    );
    width: clamp(
      tokens.$fishing-catch-media-width-min,
      22vw,
      tokens.$fishing-catch-media-width-max
    );
  }

  &__catch-image {
    display: block;
    height: auto;
    max-width: 100%;
    width: 100%;
  }

  &__result-head {
    align-items: center;
    display: flex;
    gap: 10px;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &__result-message {
    margin: 0;
  }

  &__catch-details {
    h3 {
      font-size: 16px;
      margin-bottom: 6px;
    }
  }

  &__catch-row {
    font-size: 13px;
    margin: 2px 0;
  }

  &__minigame-hud {
    display: grid;
    gap: 10px;
  }

  &__bar {
    background: tokens.$fishing-minigame-bar-background;
    border-radius: tokens.$fishing-minigame-bar-radius;
    height: tokens.$fishing-minigame-bar-height;
    overflow: hidden;
    position: relative;
  }

  &__bar-fill {
    height: 100%;
    transition: width 90ms linear;

    &--green {
      background: tokens.$fishing-minigame-fill-green;
    }
  }

  &__bar-marker {
    border-left: tokens.$fishing-minigame-red-width solid
      tokens.$fishing-minigame-marker-red;
    bottom: 0;
    position: absolute;
    top: 0;
    transform: translateX(calc(tokens.$fishing-minigame-red-width * -0.5));
    transition: left 90ms linear;

    &--red {
      border-left-color: tokens.$fishing-minigame-marker-red;
    }

    &--barrier {
      border-left: tokens.$fishing-minigame-barrier-width dotted
        tokens.$fishing-minigame-marker-barrier;
    }

    &--barrier-active {
      border-left-color: tokens.$fishing-minigame-marker-active;
    }
  }

  &__minigame-copy {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
  }

  &__durability {
    align-items: center;
    display: grid;
    gap: 8px;
    grid-template-columns: auto 1fr auto;
  }

  &__durability-label {
    color: tokens.$fishing-panel-muted;
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &__durability-track {
    background: #2f3643;
    border-radius: 999px;
    height: 12px;
    overflow: hidden;
  }

  &__durability-fill {
    background: linear-gradient(90deg, #46c27a 0%, #ef8748 55%, #d93a3a 100%);
    height: 100%;
    transition: width 90ms linear;
  }

  &__durability-value {
    color: tokens.$fishing-panel-muted;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  a:focus-visible {
    @include mixins.focus-ring(tokens.$button-focus-ring);
  }
}

@media (max-width: tokens.$fishing-breakpoint-tablet) {
  .fishing-page {
    height: auto;
    min-height: 100dvh;
    overflow: auto;

    &__stage {
      display: grid;
      gap: 12px;
      overflow: visible;
    }

    &__play-area {
      aspect-ratio: 3 / 2;
      height: auto;
      inset: auto;
      position: relative;
    }

    &__hud-panel,
    &__hud-tray {
      left: auto;
      max-height: none;
      max-width: none;
      position: relative;
      right: auto;
      top: auto;
      transform: none;
      width: 100%;
    }

    &__groundbait-panel {
      bottom: auto;
    }

    &__inventory-launcher {
      bottom: 12px;
      right: 12px;
    }
  }
}

@media (max-width: tokens.$fishing-breakpoint-mobile) {
  .fishing-page {
    padding: 12px;

    &__header {
      align-items: flex-start;
      flex-direction: column;
      gap: 6px;
    }

    &__hud-panel,
    &__hud-tray {
      padding: 14px;
    }

    &__cast-row {
      gap: 8px;
    }

    &__phase-chip {
      font-size: 12px;
    }

    &__catch-card {
      grid-template-columns: 1fr;
    }

    &__catch-media {
      width: 100%;
    }

    &__result-head {
      align-items: stretch;
      flex-direction: column;
    }
  }
}
</style>
