<template>
  <div
    class="flask-container"
  >
    <div
      class="flask"
      :class="{ selected: isSelected }"
    >
      <div
        v-for="layer in layers"
        class="liquid"
        :style="{ height: layer.percent + '%', backgroundColor: layer.color }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Flask',
  props: {
    layers: {
      type: Array,
      default: () => []
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.flask-container {
  display: inline-block; /* Чтобы колбы стояли в ряд */
  margin: 10px;
}

.flask {
  width: 80px;          /* Ширина */
  height: 200px;        /* Высота */
  border: 3px solid #f0f0f0; /* Серая обводка, как стекло */
  border-radius: 0 0 30px 30px; /* Закругляем низ, имитируя дно колбы */
  border-top: none;     /* Убираем верхнюю границу, чтобы было похоже на открытую колбу */
  position: relative;   /* Нужно для позиционирования слоев воды внутри */
  background-color: #333; /* Светло-серый фон пустой колбы */
  overflow: hidden;     /* Чтобы вода не вылезала за закругленные края */
  display: flex;
  flex-direction: column-reverse; /* Слои воды будут наливаться снизу вверх! */
}

.liquid {
  width: 100%;          /* На всю ширину колбы */
  transition: height 0.2s ease; /* Плавное изменение высоты при переливаниях */
}

.flask.selected {
  border-color: gold;  /* Золотая обводка для выбранной колбы */
  box-shadow: 0 0 10px gold;
  transform: scale(1.02);  /* Чуть увеличиваем */
  transition: all 0.2s ease;
}
</style>