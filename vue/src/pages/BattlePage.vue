<template>
  <section v-if="mission" class="battle-page">
    <header class="battle-page__header">
      <div>
        <p class="battle-page__eyebrow">Уровень {{ mission.order }}</p>
        <h1>Уровень сложности: {{ mission.difficulty }}</h1>
      </div>
      <RouterLink class="battle-page__back" :to="{ name: $routes.MISSIONS }">К списку уровней</RouterLink>
    </header>

    <div class="battle-page__layout">
      <ControlPanel
        :budget="budget"
        :wave="wave"
        :tool-mode="toolMode"
        :barrier-material="barrierMaterial"
        :barrier-catalog="barrierCatalog"
        :selected-turret="selectedTurret"
        :turret-install-cost="turretInstallCost"
        :artillery-cost="artilleryCost"
        :squad-cost="squadCost"
        @choose-tool="store.dispatch('chooseTool', $event)"
        @choose-barrier-material="store.dispatch('chooseBarrierMaterial', $event)"
        @deploy-squad="store.dispatch('deploySquad')"
        @upgrade-turret="store.dispatch('upgradeSelectedTurret')"
        @sell-turret="store.dispatch('sellSelectedTurret')"
      />

      <BattleArena
        :mission="mission"
        :route-pixels="routePixels"
        :turrets="turrets"
        :hostiles="hostiles"
        :squads="squads"
        :barriers="barriers"
        :shells="shells"
        :selected-turret-id="selectedTurret?.id ?? null"
        :result="result"
        @measure="store.dispatch('setArenaSize', $event)"
        @fire-artillery="store.dispatch('fireArtillery', $event)"
        @press-pad="store.dispatch('pressPad', $event)"
        @press-barrier-slot="store.dispatch('pressBarrierSlot', $event)"
        @select-turret="store.dispatch('selectTurret', $event)"
        @restart="store.dispatch('restartMission')"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import BattleArena from '@/components/BattleArena.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import { ROUTES } from '@/router'

const store = useStore()
const route = useRoute()
const router = useRouter()

const mission = computed(() => store.getters.mission)
const budget = computed(() => store.getters.budget)
const wave = computed(() => store.getters.wave)
const toolMode = computed(() => store.getters.toolMode)
const barrierMaterial = computed(() => store.getters.barrierMaterial)
const barrierCatalog = computed(() => store.getters.barrierCatalog)
const turretInstallCost = computed(() => store.getters.turretInstallCost)
const artilleryCost = computed(() => store.getters.artilleryCost)
const squadCost = computed(() => store.getters.squadCost)
const selectedTurret = computed(() => store.getters.selectedTurret)
const routePixels = computed(() => store.getters.routePixels)
const turrets = computed(() => store.getters.turrets)
const hostiles = computed(() => store.getters.hostiles)
const squads = computed(() => store.getters.squads)
const barriers = computed(() => store.getters.barriers)
const shells = computed(() => store.getters.shells)
const result = computed(() => store.getters.result)

watch(
  () => route.params.missionId,
  async (missionId) => {
    const loaded = await store.dispatch('loadMission', missionId)
    if (!loaded) {
      router.replace({ name: ROUTES.MISSIONS })
    }
  },
  { immediate: true }
)

onMounted(() => {
  store.dispatch('startLoop')
})

onBeforeUnmount(() => {
  store.dispatch('stopLoop')
})
</script>

<style scoped>
.battle-page {
  display: grid;
  gap: 18px;
}

.battle-page__header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}

.battle-page__eyebrow {
  margin-bottom: 8px;
  color: var(--accent-soft);
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.battle-page h1 {
  margin-bottom: 10px;
  font-size: clamp(2rem, 4vw, 3.3rem);
}

.battle-page__back {
  padding: 12px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.battle-page__layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

@media (max-width: 1160px) {
  .battle-page__layout {
    grid-template-columns: 1fr;
  }

  .battle-page__header {
    flex-direction: column;
  }
}
</style>
