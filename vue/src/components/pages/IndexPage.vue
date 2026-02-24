<template>
  <div>
    <CustomButton :type="'red'" @click="() => addCount(5)">+5</CustomButton>

    <CustomButton @click="() => addCount(10)" @len="(v) => check(v)">
      123
      <template #count>
        999
      </template>
    </CustomButton>
    <CustomButton @click="() => addCount(10)"></CustomButton>
    <CustomButton @click="() => addCount(10)" />

    <div>
      <template v-for="(i, index) in getListPower" :key="index">
        <div :class="[]">
          {{ i }}, {{ index }}
        </div>
      </template>
      <!--
      <div v-for="i in getList" :key="i.t ?? i">
        {{ i }}
      </div>
      -->
    </div>
  </div>
</template>

<script>
import CustomButton from '@/components/ui/CustomButton.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    CustomButton
  },
  data () {
    return {
      count: 10,
      params: []
    }
  },
  computed: {
    ...mapGetters('list', [
      'getList',
      // 'getListPower'
      'getListPower'
    ]),
    c2pr () {
      return 2 * Math.PI * this.count
    }
  },
  mounted () {
    console.log(this.getList[0].t)
    this.getList[0].t = 90
  },
  methods: {
    ...mapActions('list', [
      'setList'
    ]),
    addCount (v = 10) {
      this.count += v
      // const p = [...this.getListPower]
      // p.push(v)
      // this.setList(p)

      // asdas
    },
    check (v) {
      alert(v)
    }
  }
}
</script>
