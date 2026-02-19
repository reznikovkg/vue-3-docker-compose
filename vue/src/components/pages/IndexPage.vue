<template>
  <div>
    <h1>Пример с пары</h1>

    <div>
      R: {{ count }}
    </div>
    <div>
      2PR: {{ c2pr }}
    </div>

    <CustomButton :type="'red'" @click="() => addCount(5)">+5</CustomButton>

    <CustomButton @click="() => addCount(10)" @len="(v) => check(v)">
      123
      <template #count>
        999
      </template>
    </CustomButton>

    <CustomButton @click="() => addCount(10)">Кнопка</CustomButton>
    <CustomButton @click="() => addCount(10)" />

    <h1>Эксперимент с input</h1>

    <input>

    <CustomInput v-model="myText" />
    <p>Введенное значение: {{ myText }}</p>

    <CustomInput v-model="errorField" status="red" />

    <CustomInput v-model="testPlaceholder" placeholder="Введите" />

  </div>
</template>

<script>
import CustomButton from '@/components/ui/CustomButton.vue'
import CustomInput from '@/components/ui/CustomInput.vue'


export default {
  name: 'IndexPage',
  components: {
    CustomButton,
    CustomInput
  },
  data () {
    return {
      count: 10,
      myText: '',
      errorField: '',
      testPlaceholder: '',
    }
  },
  computed: {
    c2pr () {
      return 2 * Math.PI * this.count
    }
  },
  methods: {
    addCount (v = 10) {
      this.count += v
    },
    check (v) {
      alert(v)
    }
  }
}
</script>

<style scoped>

</style>
