<template>
  <button @click="() => click()"><slot>Начать!</slot> ({{ count }}, {{ globalCount }}), {{ countT }}</button>
</template>

<script>
export default {
  name: 'MyButton',
  // model: {
  //   prop: 'value',
  //   event: 'update'
  // },
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    globalCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['click'],
  data () {
    return {
      count: 0
    }
  },
  computed: {
    countT () {
      return this.count + 5
    }
  },
  created () {
    this.click()
  },
  mounted () {
    this.click()
  },
  methods: {
    click () {
      this.count += 1
      this.$emit('click', this.count)

      // this.$router.push('/about')
    },
    change (v) {
      this.$emit('update:modelValue', v)
    }
  },
}
</script>

<style scoped>

</style>
