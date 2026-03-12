<template>
  <section class="persistence-debug-panel">
    <h3>{{ title }}</h3>
    <p>Reusable persistence test panel for save/load/clear verification.</p>

    <div class="persistence-debug-panel__row">
      <BaseButton
        v-for="testCase in testCases"
        :key="testCase.id"
        @click="() => runTestCase(testCase.id)"
      >
        {{ testCase.label }}
      </BaseButton>
      <BaseButton @click="() => refreshSnapshot()">
        Refresh snapshot
      </BaseButton>
    </div>

    <div
      class="persistence-debug-panel__result"
      :class="{
        'persistence-debug-panel__result--pass': lastResult === 'pass',
        'persistence-debug-panel__result--fail': lastResult === 'fail',
      }"
    >
      <p><strong>Last action:</strong> {{ lastAction }}</p>
      <p><strong>Last result:</strong> {{ lastResult }}</p>
      <ul v-if="lastExpected.length" class="persistence-debug-panel__list">
        <li v-for="item in lastExpected" :key="item">{{ item }}</li>
      </ul>
      <ul v-if="lastMessages.length" class="persistence-debug-panel__list">
        <li v-for="item in lastMessages" :key="item">{{ item }}</li>
      </ul>
    </div>

    <div class="persistence-debug-panel__grid">
      <div class="persistence-debug-panel__card">
        <h4>Store progress</h4>
        <pre>{{ storeProgressFormatted }}</pre>
      </div>

      <div class="persistence-debug-panel__card">
        <h4>Storage raw</h4>
        <pre>{{ storageRawFormatted }}</pre>
      </div>

      <div class="persistence-debug-panel__card">
        <h4>Storage parsed</h4>
        <pre>{{ storageParsedFormatted }}</pre>
      </div>
    </div>
  </section>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue';
import {
  TEST_CASES,
  buildProgressSnapshot,
  runCase,
} from '@/testing/persistenceHarness';

export default {
  name: 'PersistenceDebugPanel',
  components: {
    BaseButton,
  },
  props: {
    title: {
      type: String,
      default: 'Persistence Debug Panel',
    },
  },
  data() {
    return {
      testCases: TEST_CASES,
      lastAction: 'Idle',
      lastResult: 'idle',
      lastExpected: [],
      lastMessages: [],
      snapshot: {
        storeProgress: null,
        storageRaw: null,
        storageParsed: null,
      },
    };
  },
  computed: {
    storeProgressFormatted() {
      return this.stringifySafe(this.snapshot.storeProgress);
    },
    storageRawFormatted() {
      if (this.snapshot.storageRaw === null) {
        return 'null';
      }

      return this.snapshot.storageRaw;
    },
    storageParsedFormatted() {
      return this.stringifySafe(this.snapshot.storageParsed);
    },
  },
  created() {
    this.refreshSnapshot();
  },
  methods: {
    stringifySafe(value) {
      if (value === null || value === undefined) {
        return 'null';
      }

      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    },
    refreshSnapshot() {
      this.snapshot = buildProgressSnapshot(this.$store);
    },
    runTestCase(caseId) {
      const result = runCase(this.$store, caseId);
      this.lastAction = result.label;
      this.lastResult = result.pass ? 'pass' : 'fail';
      this.lastExpected = result.expected || [];
      this.lastMessages = result.messages || [];
      this.snapshot = result.snapshot;
    },
  },
};
</script>

<style scoped lang="scss">
.persistence-debug-panel {
  border: 1px solid #ccd0d6;
  border-radius: 8px;
  margin-top: 12px;
  padding: 12px;
}

.persistence-debug-panel__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.persistence-debug-panel__result {
  border: 1px solid #ccd0d6;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 10px;
}

.persistence-debug-panel__result--pass {
  border-color: #187a45;
}

.persistence-debug-panel__result--fail {
  border-color: #b12f2f;
}

.persistence-debug-panel__list {
  margin: 6px 0 0;
  padding-left: 18px;
}

.persistence-debug-panel__grid {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
}

.persistence-debug-panel__card {
  border: 1px solid #ccd0d6;
  border-radius: 8px;
  padding: 10px;
}

.persistence-debug-panel__card pre {
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
