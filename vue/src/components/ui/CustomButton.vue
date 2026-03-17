<template>
    <button class="c-button" :class="`c-button--${type}`">
        <div class="c-button__icon" :class="`c-button__icon--${icon}`">
            +
        </div>
        <slot>Кнопка</slot>
        (<slot name="count">0</slot>)
    </button>
</template>



<script>
export default{
    name:'CustomButton',
    props:{
        type:{
            default:'default',
            type:String
        },
        icon:{
            default:'default',
            type:String
        }
    }
}
</script>


<style scoped lang="scss">
.c-button{
    border:1px solid #224fab;
    background: #0d3a93;
    font-size:12px;
    padding: 5px;
    margin: 5px;
    display:flex;
&--red{
    border:1px solid #841713;
    background: #93250d;
    color:red
}
&__icon{
    color:aqua;
    &--black{
        color:black
    }
}
}
</style>