<template>

<button class="c-button" :class="'c-button--' + type">
<slot>Кнопочка-наша</slot>
<template v-if=" $slots.count"> <!--если бы строка ниже не была обернута в template, то в скобочках на кнопочках были нули-->
(<slot name = "count">0</slot>)
</template>

</button>

</template>

<script>
export default{
    name: 'CustomButton',
    props: {
        type:{
            default: 'default',
            type: String
            
        }
    }
}
</script>

<style lang = "scss">
.c-button {
    border: 1px solid #00d199;
    background: #009200;
    color: white;
    font-size: 12px;
    padding: 5px;
    margin: 5px;

    &--red {
          border: 1px solid #ff7d7d;
          background: #5a0c00;
    }
}
</style>