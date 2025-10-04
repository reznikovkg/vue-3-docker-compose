<template>
  <div class="load-screen">
    <h1>LOADING<span class="dots"></span></h1>
  </div>
</template>

<style>
.load-screen {
  width: 100%;
  height: 100%;
  display: flex;
  color: #f2f2f2;
  justify-content: center;
  align-items: center;
  background: saddlebrown;
  margin-bottom: 20px;
}
.dots {
  display: inline-block;
  width: 2ch;
  text-align: left;
}
.dots::after {
  content: "";
  animation: dots 1.5s steps(4, end) infinite;
}
@keyframes dots {
  0%   { content: ""; }
  25%  { content: "."; }
  50%  { content: ".."; }
  75%  { content: "..."; }
  100% { content: ""; }
}
</style>
