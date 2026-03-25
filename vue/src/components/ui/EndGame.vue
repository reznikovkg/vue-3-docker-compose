<script>
export default {
  name: "EndGame",
}
</script>
<template>
  <div class="end">
    <p class="end__p end__head">Победа</p>
    <RouterLink to="/" class="end__again">Заново</RouterLink>
  </div>
</template>
<style scoped lang="scss">
.end {
  background-color: #fffaee;
  border: 2px solid #194d6c;
  border-radius: 40px;
  padding: 2vh;
  box-shadow: 0 6px 12px 0 #194d6c;
  overflow: hidden;


  &__head {
    font-size: 40px;
    text-align: center;
    background-color: #e5f4fb;
    text-transform: uppercase;
    box-shadow: 0px 4px 8px #97ceef;
    border-radius: 20px;
    border: 1px solid #194d6c;
  }

  &__p {
    color: #194d6c;
    font-size: 30px;
    padding: 2vh;
    padding-left: 6vw;
    padding-right: 6vw;
    font-weight: bold;
  }

  &__again {
    display: block;
    text-align: center;
    color: #194d6c;
    font-size: 30px;
    padding: 2vh;
    font-weight: bold;
    background-color: #abdaf4;
    border: none;
    border-radius: 50px;
    //width: 60%;
    margin-left: 20%;
    margin-right: 20%;
    margin-top: 5vh;
    margin-bottom: 15px;
    box-shadow: 0 6px 12px 0 #194d6c;
    border-width: 2px;
    border-style: solid;
    //transition: all 0.2s ease;
  }

  &__again:hover {
    color: #194d6c;
    font-size: 35px;
    padding: 2vh;
    font-weight: bold;
    background-color: #abdaf4;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    //width: 70%;
    margin-left: 15%;
    margin-right: 15%;
    margin-top: 5vh;
    margin-bottom: 7px;
    box-shadow: 0 8px 16px 0 #194d6c;
    border-width: 2px;
    border-style: solid;

  }
}
</style>