<template>
  <div>
    <div>
      R: {{ count }}
    </div>
    <div>
      2PR: {{ c2pr }}
    </div>
    <div>
      TEXT: {{ lastText }}
    </div>
    <div>
      LEN: {{ lastLen }}
    </div>

    <CustomButton :type="'red'" @click="() => addCount(5)">+5</CustomButton>

    <CustomButton @click="() => addCount(10)" @len="onLen" @text="onText">
      +10
      <template #count>
        999
      </template>
    </CustomButton>

    <CustomButton @click="() => addCount(10)" @len="onLen" @text="onText">+10</CustomButton>
    <CustomButton :type="'disabled'" @click="() => addCount(10)" @len="onLen" @text="onText">+10</CustomButton>
  </div>
</template>

<script>
import CustomButton from '@/components/ui/CustomButton.vue'

export default {
  name: 'IndexPage',
  components: {
    CustomButton
  },
  data () {
    return {
      count: 10,
      lastLen: null,
      lastText: ''
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
    onLen (v) {
      this.lastLen = v
    },
    onText (t) {
      this.lastText = t
    }
  }
}
</script>

<style scoped>
</style>
