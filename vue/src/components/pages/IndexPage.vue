<template>
  <div class="container">
    <div class="counter">
      <h2 class="title">Счётчик</h2>
      <div class="values">
        <div>
          R: {{ count }}
        </div>
        <div>
          2PR: {{ c2pr }}
        </div>
      </div>
      <CustomButton :type="'red'" @click="() => addCount(5)">+5</CustomButton>
      <CustomButton @click="() => addCount(10)">
        123
        <template #count>
          999
        </template>
      </CustomButton>
      <CustomButton @click="() => addCount(10)"></CustomButton>
      <CustomButton @click="() => addCount(10)"/>
      <CustomButton :type="'green'" @click="() => multiplyCount()">х2</CustomButton>
      <CustomButton :type="'yellow'" @click="() => resetCount()">Сброс значений</CustomButton>
    </div>
  </div>
</template>

<script>
import CustomButton from "@/components/ui/CustomButton.vue";

export default {
  name: 'IndexPage',
  components: {
    CustomButton
  },
  data() {
    return {
      count: 10
    }
  },
  computed: {
    c2pr() {
      return 2 * Math.PI * this.count
    }
  },
  methods: {
    addCount(v = 10) {
      this.count += v
    },
    resetCount() {
      this.count = 10
    },
    multiplyCount() {
      this.count *= 2
    }
  }
}
</script>

<style scoped>
.container {
  align-items: center;
  display: flex;
  justify-content: center;
  background: #9978f4;
  min-height: 1000px;
  min-width: 1000px;
}

.counter {
  background: white;
  height: 500px;
  width: 400px;
  border-radius: 20px;
  padding: 40px;
}

.title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 28px;
}

.values {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e6ed;
  margin-bottom: 20px;
}
</style>
