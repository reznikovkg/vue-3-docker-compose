<template>
  <RouterView />
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
:root {
  --bg: #0f172a;
  --panel: #111827;
  --panel-2: #1f2937;
  --line: #334155;
  --text: #e5e7eb;
  --muted: #94a3b8;
  --accent: #38bdf8;
  --danger: #ef4444;
  --success: #22c55e;
  --warning: #f59e0b;
  --radius: 16px;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
}

button,
input,
select {
  font: inherit;
}
</style>