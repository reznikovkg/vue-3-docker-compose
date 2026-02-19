<template>
  Index

  <div>
    <RouterLink :to="{ name: $routes.EXAMPLE }">
     To Example
    </RouterLink>
  </div>

  <div>
   R: {{ count }} 
  </div> 

  <div>
   2piR: {{ c2pr }}
  </div>

  <div>
  типа суперкнопки и суперзначение:
  {{count}} <!--Найди переменную с именем count в нашем коде (в <script>) и подставь сюда её текущее значение-->
  <button @click="() => addCount()">+</button> <!--Слушай клик @click по этой кнопке и, когда он произойдет, выполни код в кавычках-->
  <button @click="() => addCount(5)">добавляем 5</button>
  </div>


<div>
  кастом кнопка:
  <CustomButton @click="() => addCount(10)">добавляем 10</CustomButton>
  <CustomButton @click="() => addCount(10)"></CustomButton>

  <CustomButton @click="() => addCount(10)">
  123
  <template #count>
  999
  </template>
  </CustomButton>
  </div>



  <div> <div>
  <CustomButton :type="'red'" @click="() => addCount(5)">кнопочка+5с типом</CustomButton> <!--А КНОПОЧКА ПОЧЕМУ-ТО НЕ КРАСНАЯ(((-->
  </div></div>

</template>

<script>

import CustomButton from '../ui/CustomButton.vue'

export default {
    name: 'IndexPage',
    components:
    {
        CustomButton
    },
    data(){
        return {
            count: 10
        }
    },
computed: {
c2pr(){
    return 2 * Math.PI * this.count
}
},
methods:
{
    addCount(v = 10)
    {
        this.count += v
    }
}
}
</script>

<style scoped>

</style>
