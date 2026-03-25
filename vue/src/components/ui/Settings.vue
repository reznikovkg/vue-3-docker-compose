<template>
  <div class="settings">
    <p class="settings__p settings__head_p">Переливатор</p>

    <div class="settings__parameter">
      <p class="settings__p">Количество колб: </p>
      <p class="settings__show_qty">{{ qtyFlasks }}</p>
    </div>
    <input type="range" min="3" max="20" step="1" :value="qtyFlasks" class="settings__input_qty" @input="(e) => changeQtyFlasks(e)">

    <div class="settings__parameter">
      <p class="settings__p">Количество цветов: </p>
      <p class="settings__show_qty">{{ qtyColors }}</p>
    </div>
    <input type="range" min="2" :max="qtyFlasks - 1" step="1" :value="qtyColors" class="settings__input_qty" @input="(e) => changeQtyColors(e)">

    <div class="settings__parameter">
      <p class="settings__p">Лимит слоев: </p>
      <p class="settings__show_qty">{{ maxQtyLayers }}</p>
    </div>
    <input type="range" min="2" :max="qtyFlasks - 1" step="1" :value="maxQtyLayers" class="settings__input_qty" @input="(e) => changeQtyLayers(e)">

    <button type="button" class="settings__btn" @click="() => handleStartGame()">Начать игру!</button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: "Settings",
  data() {
    return {
      qtyFlasks: 5,
      qtyColors: 4,
      maxQtyLayers: 4
    }
  },
  methods: {
    ...mapActions([
      'startGame'
    ]),
    handleStartGame() {
      this.startGame({
        isStartedGame: 1,
        qtyFlasks: this.qtyFlasks,
        qtyColors: this.qtyColors,
        maxQtyLayers: this.maxQtyLayers,
      });
      console.log("start game")
      this.$router.push('/game')
    },
    changeQtyFlasks(e) {
      this.qtyFlasks = Number(e.target.value)
      if (Number(e.target.value) <= this.qtyColors) {
        this.qtyColors = Number(e.target.value) - 1
      }
      if (Number(e.target.value) <= this.maxQtyLayers) {
        this.maxQtyLayers = Number(e.target.value) - 1
      }
    },
    changeQtyColors(e) {
      this.qtyColors = Number(e.target.value)
    },
    changeQtyLayers(e) {
      this.maxQtyLayers = Number(e.target.value)
    }
  }
}
</script>

<style scoped lang="scss">
  @use "sass:math";

  @function f1_y($t, $x, $y) {
    @return $y;
  }

  @function f2_y($t, $x, $y) {
    $k: 1.0;
    $m: 1.0;
    @return -($k/$m) * $x - 0.2 * $y;
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
    $scale-x: 100;
    $scale-y: 8;
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
      //$pos-x: calc(10% + $cur-t * $scale * 1px);
      //$pos-y: calc(50% - $cur-y * $scale * $scale-y * 1px);
      $pos-x: calc(50% + $cur-y * $scale-x * 1px);
      $pos-y: calc(17% + $cur-t * $scale-y * 1px);
      $point: radial-gradient(circle at $pos-x $pos-y, rgba(1, 120, 147, 1) $size, transparent $size);
      $points: append($points, $point, comma);
      //$pos-x: calc(90% - $cur-t * $scale * 1px);
      //$pos-y: calc(50% - $cur-y * $scale * $scale-y * 1px);
      //$point: radial-gradient(circle at $pos-x $pos-y, rgba(1, 120, 147, 1) $size, transparent $size);
      //$points: append($points, $point, comma);
    }

    @return $points;
  }

  .settings {
    background-color: #fffaee;
    border: 2px solid #194d6c;
    border-radius: 40px;
    padding: 2vh;
    box-shadow: 0 6px 12px 0 #194d6c;
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
      background-image: RK4(500, 0, 0, 1, 50);
      z-index: 0;
      border-radius: 40px;
    }


    &__parameter {
      display: grid;
      grid-template-columns: 4fr 1fr;
      position: relative;
      z-index: 1;
    }

    &__head_p {
      font-size: 40px;
      text-align: center;
      background-color: #e5f4fb;
      text-transform: uppercase;
      box-shadow: 0px 4px 8px #97ceef;
      border-radius: 20px;
      border: 1px solid #194d6c;
      position: relative;
      z-index: 1;
    }

    &__p {
      color: #194d6c;
      font-size: 30px;
      padding: 2vh;
      font-weight: bold;
      position: relative;
      z-index: 1;
    }

    &__show_qty {
      color: #194d6c;
      font-size: 30px;
      padding: 2vh;
      font-weight: bold;
      position: relative;
      z-index: 1;
    }

    &__btn {
      color: #194d6c;
      font-size: 30px;
      padding: 2vh;
      font-weight: bold;
      background-color: #abdaf4;
      border: none;
      border-radius: 50px;
      width: 60%;
      margin-left: 20%;
      margin-top: 3vh;
      margin-bottom: 15px;
      box-shadow: 0 6px 12px 0 #194d6c;
      border-width: 2px;
      border-style: solid;
      position: relative;
      z-index: 1;
      //transition: all 0.2s ease;
    }

    &__btn:hover {
      color: #194d6c;
      font-size: 35px;
      padding: 2vh;
      font-weight: bold;
      background-color: #abdaf4;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      width: 70%;
      margin-left: 15%;
      margin-top: 3vh;
      margin-bottom: 10px;
      box-shadow: 0 8px 16px 0 #194d6c;
      border-width: 2px;
      border-style: solid;
      position: relative;
      z-index: 1;
    }

    &__input_qty {

      width: 70%;
      //height: 6px;
      background: #e0e0e0;
      border-radius: 10px;
      margin-left: 15%;
      margin-bottom: 2vh;
      border-color: #0b649a;
      -webkit-appearance: none;
      appearance: none;
      position: relative;
      z-index: 1;
    }

    &__input_qty::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: #3b82f6;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 8px 18px 0 #194d6c;
      transition: 0.1s;
      position: relative;
      z-index: 1;
      //border-style: solid;
    }

    &__input_qty::-webkit-slider-thumb:hover {
      transform: scale(1.3);
      background: #286185;
      box-shadow: 0 8px 18px 0 #194d6c;
      position: relative;
      z-index: 1;
    }

    &__input_qty::-webkit-slider-thumb:active {
      transform: scale(1.3);
      background: #286185;
      box-shadow: 0 8px 18px 0 #194d6c;
      position: relative;
      z-index: 1;
    }

    &__input_qty::-webkit-slider-runnable-track {
      //height: 6px;
      width: 70%;
      background: linear-gradient(to right, #abdaf4, #82aaef);
      border-radius: 10px;
      border-color: #194d6c;
      border-width: 1px;
      border-style: solid;
      box-shadow: 0 3px 6px 0 #194d6c;
      position: relative;
      z-index: 1;
    }
  }

</style>