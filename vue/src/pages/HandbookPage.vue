<template>
  <section class="handbook">
    <div class="handbook__card">
      <p class="handbook__eyebrow">Игровые правила</p>
      <h1>Как устроена оборона и чем пользоваться по ходу миссии</h1>
      <ul class="handbook__list">
        <li>Турели ставятся только на заранее подготовленные круглые площадки.</li>
        <li>Улучшение выбранной турели повышает урон, радиус, скорострельность и запас прочности.</li>
        <li>Заграждения ставятся на отмеченные дорожные сегменты и задерживают врага до разрушения.</li>
        <li>Союзный отряд выходит с конца маршрута и двигается навстречу волне.</li>
        <li>Артудар вызывается по произвольной точке поля и наносит максимальный урон в центре взрыва.</li>
        <li>Если любой противник доходит до конца пути, миссия мгновенно проиграна.</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.handbook {
  display: grid;
  place-items: start;
}

.handbook__card {
  max-width: 880px;
  padding: 32px;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(70, 135, 173, 0.18), rgba(10, 20, 29, 0.95)),
    rgba(10, 20, 29, 0.95);
}

.handbook__eyebrow {
  margin-bottom: 12px;
  color: var(--accent-soft);
  font-size: 0.76rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.handbook h1 {
  margin-bottom: 18px;
  font-size: clamp(2rem, 4vw, 3.2rem);
}

.handbook__list {
  display: grid;
  gap: 14px;
  padding-left: 18px;
  color: var(--text-muted);
}
</style>
