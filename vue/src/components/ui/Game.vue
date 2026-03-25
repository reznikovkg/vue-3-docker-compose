<template>
  <div class="game" :style="gameStyle">
    <Flask
        v-for="i in qtyFlasks"
        :ref="flask => flaskRefs[i] = flask"
        :style="flaskStyle" :index="i"
        @click="() => handleClick(i)"
        @flaskUpdated="(activeIndex) => handleFlaskUpdate(activeIndex)">
    </Flask>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Flask from "@/components/ui/Flask.vue";

export default {
  name: "Game",
  components: {Flask},
  data() {
    return {
      columnCount: 0,
      flaskRefs: {}
    }
  },
  computed: {
    ...mapGetters({
      qtyFlasks: 'getQtyFlasks',
      clicks: "getClicks"
    }),
    rowsCount() {
      return Math.ceil(this.qtyFlasks / this.columnCount)
    },
    gameStyle() {
      return {
        gap: `calc(3vw - ${this.rowsCount - 1}vw)`
      }
    },
    flaskStyle() {
      return {
        maxWidth: `min(100%, calc(((70vw - 6vh - 3vw - 20px) / ${this.columnCount}) * 0.95))`,
        height: `min(calc(((70vh - 6vh - 3vw - 20px) / ${this.rowsCount}) * 0.95), 100%)`,
        aspectRatio: '1/4'
      }
    }
  },
  mounted() {
    this.updateColumnCount()
    window.addEventListener('resize', this.updateColumnCount)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateColumnCount)
  },
  methods: {
    ...mapActions([
      'pickActiveFlask',
      'pickTargetFlask',
      'resetFlasks'
    ]),
    updateColumnCount() {
      this.$nextTick(() => {
        const gameElement = this.$el
        const gridStyles = window.getComputedStyle(gameElement)
        const gridTemplateColumns = gridStyles.getPropertyValue('grid-template-columns')
        const columnCount = gridTemplateColumns.split(' ').filter(x => parseFloat(x) > 0).length
        console.log(`Количество столбцов: ${columnCount}, ${gridTemplateColumns}`)
        this.columnCount = columnCount
      })
    },
    handleClick(index) {
      if (this.clicks === 0) {
        console.log(`active ${index}`, this.clicks)
        this.pickActiveFlask({isActiveFlask: index})
      } else {
        console.log(`target ${index}`, this.clicks)
        this.pickTargetFlask({isTargetFlask: index})
      }
    },
    handleFlaskUpdate(activeIndex) {
      console.log("handleFlaskUpdate: ", activeIndex.activeIndex)
      const activeFlask = this.flaskRefs[activeIndex.activeIndex]
      if (activeFlask) {
        activeFlask.layers = activeFlask.layersActiveFlask.map(l => ({...l}))
      }
    }
  }
}
</script>

<style scoped lang="scss">
  @use "sass:math";

  @function f1_y($t, $x, $y) {
    $alpha: 0.25;
    $beta: 0.01;
    @return $alpha * $x - $beta * $x * $y;
  }

  @function f2_y($t, $x, $y) {
    $delta: 0.005;
    $gamma: 0.25;
    @return $delta * $x * $y - $gamma * $y;
  }
  //@function RK_iter($x, $y, $h) {
  //  $k1: f($x, $y);
  //  $k2: f($x + $h / 2, $y + $h * $k1 / 2);
  //  $k3: f($x + $h / 2, $y + $h * $k2 / 2);
  //  $k4: f($x + $h, $y + $h * $k3);
  //
  //  $new-y: $y + $h * ($k1 + 2*$k2 + 2*$k3 + $k4) / 6;
  //  @return $new-y;
  //}

  @function solve_y_system_RK_1_iter($t, $x_i, $y_i, $h, $f1_y, $f2_y) {
    $k1_x: $h * call($f1_y, $t, $x_i, $y_i);
    $k1_y: $h * call($f2_y, $t, $x_i, $y_i);

    $k2_x: $h * call($f1_y, $t + $h / 2, $x_i + 1 / 2 * $k1_x, $y_i + 1 / 2 * $k1_y);
    $k2_y: $h * call($f2_y, $t + $h / 2, $x_i + 1 / 2 * $k1_x, $y_i + 1 / 2 * $k1_y);

    $k3_x: $h * call($f1_y, $t + $h / 2, $x_i + 1 / 2 * $k2_x, $y_i + 1 / 2 * $k2_y);
    $k3_y: $h * call($f2_y, $t + $h / 2, $x_i + 1 / 2 * $k2_x, $y_i + 1 / 2 * $k2_y);

    $k4_x: $h * call($f1_y, $t + $h, $x_i + $k3_x, $y_i + $k3_y);
    $k4_y: $h * call($f2_y, $t + $h, $x_i + $k3_x, $y_i + $k3_y);

    $x_i_1: $x_i + 1 / 6 * ($k1_x + 2 * $k2_x + 2 * $k3_x + $k4_x);
    $y_i_1: $y_i + 1 / 6 * ($k1_y + 2 * $k2_y + 2 * $k3_y + $k4_y);

    @return ($x_i_1, $y_i_1);
  }

  @function RK4($layers, $t, $x, $y, $t_end) {
    $points: ();
    $h: ($t_end - $t) / $layers;
    $scale-x: 10;
    $scale-y: 2;
    $cur-t: $t;
    $cur-x: $x;
    $cur-y: $y;

    $initial-point: radial-gradient(circle at calc(10% + $cur-t * $scale-x * 1px) calc(50% - $cur-y * $scale-y * 1px),
        rgb(1, 120, 147) 2px, transparent 2px);
    $points: append($points, $initial-point, comma);

    @for $i from 1 through $layers {
      $size: 2px;
      $cur-coords: solve_y_system_RK_1_iter($cur-t, $cur-x, $cur-y, $h, f1_y, f2_y);
      $cur-x: nth($cur-coords, 1);
      $cur-y: nth($cur-coords, 2);
      $cur-t: $cur-t + $h;
      $pos-t: calc(5% + $cur-t * $scale-x * 1px);
      $pos-x: calc(80% - $cur-x * $scale-y * 1px);
      $pos-y: calc(80% - $cur-y * $scale-y * 1px);


      $point1: radial-gradient(circle at $pos-t $pos-x, rgba(1, 120, 147, 1) $size, transparent $size);
      $point2: radial-gradient(circle at $pos-t $pos-y, rgb(139, 221, 206) $size, transparent $size);
      $points: append($points, $point1, comma);
      $points: append($points, $point2, comma);
    }

    @return $points;
  }

  .game {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10vw, 1fr));
    justify-items: center;
    align-items: center;
    //gap: 3vw;
    padding: 3vh;
    width: 70vw;
    height: 70vh;
    background-color: #fffaee;
    border-radius: 30px;
    border: 3px solid #194d6c;
    box-shadow: 0 9px 18px 0 #194d6c;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      pointer-events: none;
      //mix-blend-mode: overlay;
      background-image: RK4(1000, 0, 10, 10, 200);
      z-index: 0;
      border-radius: 40px;
    }
  }

</style>