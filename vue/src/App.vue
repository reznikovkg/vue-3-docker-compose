<template>
  <div class="app">
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.app {
  font-family: sans-serif;
  text-align: center;
  color: #fff;
  background: linear-gradient(145deg, #ffff6b, #ee5a24);
  min-height: 100vh;
  // min-height: 100dvh; /* Учитываем адресную строку браузера на мобильных */
  padding: 20px;
  
  /* Блокируем скролл */
  overflow: hidden;
  // position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  
  /* Блокируем bounce эффект и pull-to-refresh */
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 768px) {
    padding: 0px;
  }
}
</style>

<style>
/* Глобальные стили для блокировки скролла */

html, body {  width: 100%;
  height: 100%;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
} 
/*overflow: hidden;
position: fixed;
*/

/* Блокируем масштабирование при двойном тапе */
* {
  touch-action: pan-x pan-y;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Разрешаем выделение текста в инпутах */
input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
</style>