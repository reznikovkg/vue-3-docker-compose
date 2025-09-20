<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <RouterLink to="/">Go to Home</RouterLink>
    <RouterLink to="/about">Go to About</RouterLink>
    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    {{ r }} // {{ globalCount }} / {{ cGlobal }} / {{ cGlobalT }} // {{ text }}
    <MyButton :global-count="globalCount" @click="() => eventClick()" />
    <MyButton :global-count="globalCount * 5" />
    <MyButton>Супер-кнопка {{ globalCount + globalCount }}</MyButton>
    <MyButton />
    <MyButton v-model="r" @change="v => log(v)" />


<!--    <input v-model="text" type="text" id="text">-->


    {{ route.params.id }}
    <RouterView />
  </main>
</template>

<script setup>
import HelloWorld from './components/HelloWorld.vue'
import MyButton from './components/MyButton.vue'
import { ref, onMounted, onBeforeMount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const globalCount = ref(10)

const text = ref('Hi')
const r = ref(10)

const cGlobal = computed(() => globalCount.value * 5)
const cGlobalT = computed(() => 10 + 25)

const eventClick = (count) => {
  globalCount.value += 1
}

const log = (v) => {
  console.log(v)
  console.log(router)
}

onMounted(() => {
  eventClick()
  console.log('onMounted')
})

onBeforeMount(() => {
  console.log('onBeforeMount')
})
</script>

<style scoped lang="scss">
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
