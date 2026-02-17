<template>

  <div>
  <div>
      R: {{ count }}
    </div>
    <div>
      2PR: {{ c2pr }}
    </div>
    <div>
    Квадрат R: {{ squaredR }}
    </div>
    <div>
    Кликов: {{ clickCount }}
    </div>

    <CustomButton :type="'red'" @click="() =>handleClick(5)">+5</CustomButton>

    <CustomButton @click="() =>handleClick(10)" @len="(v) => check(v)" small>
      123
      <template #count>
        999
      </template>
    </CustomButton>

    <CustomButton @click="() =>handleClick(10)">Кнопка</CustomButton>
    <CustomButton @click="() =>handleClick(10)" />
  </div>
</template>

<script>
import CustomButton from "../ui/CustomButton.vue";

export default {
  name: 'IndexPage',
  components: {
    CustomButton
  },
  data () {
    return {
      count: 10,
      clickCount: 0
    }
  },
  computed: {
    c2pr () {
      return 2 * Math.PI * this.count
    },
    squaredR () {
         return this.count * this.count
    }
  },
  methods: {
    handleClick (v) {
        this.addCount(v)
        this.clickCount++
      },
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