<template>
    <div class="main">
        <div class="header"></div>
        <div class="base">
            <h1>Пятнашки</h1>
            <h3>Размер: {{ size }} x {{ size }}</h3>
            <input type="range" min="3" max="5" v-bind:value="size" @input="inputValue">
            <router-link :to="{ path: '/game', query: { size: size } }">
                <button class="btn">Начать игру</button>
            </router-link>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
            size: this.$route.query.size || 4,
        }      
    },
    methods: {
        inputValue (event) {
            this.size = event.target.value;
        }
    }
}
</script>

<style>

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.main {
    height: 100vh;
    background-color: #b3fff1;
}

.base {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: fit-content;
    margin: 0 auto;
    border: solid;
    border-radius: 5px;
    padding: 20px;
    gap: 10px;
}

.header {
    height: 40vh;
}

.btn {
    background-color: teal;
    padding: 10px;
    border-radius: 15px;
    border:none;
}

</style>
