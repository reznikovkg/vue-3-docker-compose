<template>
  <div class="game-container">
    <h1>Лабиринт Закрасчик</h1>

    <div class="stats">
      <span>Уровень: <strong>{{ level + 1 }}</strong></span>
      <span>⏱️ <strong>{{ time }} сек</strong></span>
      <span>Закрашено: <strong>{{ paintedCount }} / {{ totalFloors }}</strong></span>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvas" class="maze-canvas"></canvas>
    </div>

    <button @click="resetLevel">Сбросить уровень</button>

    <p v-if="won" class="win-message">УРОВЕНЬ ПРОЙДЕН</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvas = ref(null)
const ctx = ref(null)

const ROWS = 9
const COLS = 9
const CELL = 42

const level = ref(0)
const player = ref({ r: 1, c: 1 })

const maze = ref([])
const painted = ref([])
const particles = ref([])

const won = ref(false)
const time = ref(0)
let timerInterval

const generateMaze = () => {
  const maze = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false))

  const stack = [[1, 1]]
  visited[1][1] = true
  maze[1][1] = 1

  const dirs = [[0,2],[0,-2],[2,0],[-2,0]]
  const inside = (r,c)=>r>0 && r<ROWS-1 && c>0 && c<COLS-1

  while (stack.length) {
    const [r,c] = stack[stack.length-1]

    const neighbors = dirs
      .map(([dr,dc]) => [r+dr,c+dc])
      .filter(([nr,nc]) => inside(nr,nc) && !visited[nr][nc])

    if (!neighbors.length) {
      stack.pop()
      continue
    }

    const [nr,nc] = neighbors[Math.floor(Math.random()*neighbors.length)]

    maze[r+(nr-r)/2][c+(nc-c)/2] = 1
    maze[nr][nc] = 1
    visited[nr][nc] = true

    stack.push([nr,nc])
  }

  return maze
}

class Particle {
  constructor(x,y,opt={}) {
    this.x=x
    this.y=y
    this.vx=opt.vx??(Math.random()-0.5)*2
    this.vy=opt.vy??(Math.random()-0.5)*2
    this.life=opt.life??30
    this.size=opt.size??3
    this.color=opt.color??'#ff66ff'
    this.angle=Math.random()*Math.PI*2
    this.speed=Math.random()*0.05+0.02
  }

  update(){
    this.life--
    this.angle += this.speed
    this.x += Math.cos(this.angle)*1.5 + this.vx
    this.y += Math.sin(this.angle)*1.5 + this.vy
    this.vy += 0.05
  }

  draw(ctx){
    ctx.globalAlpha=this.life/30
    ctx.fillStyle=this.color
    ctx.beginPath()
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2)
    ctx.fill()
    ctx.globalAlpha=1
  }
}

const totalFloors = computed(()=>maze.value.flat().filter(c=>c===1).length)
const paintedCount = computed(()=>painted.value.flat().filter(Boolean).length)

let t = 0

const draw = () => {
  t += 0.05
  ctx.value.clearRect(0,0,canvas.value.width,canvas.value.height)

  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const x=c*CELL
      const y=r*CELL

      if(maze.value[r][c]===0){
        ctx.value.fillStyle='#222'
        ctx.value.fillRect(x,y,CELL,CELL)
      } else {
        const p = painted.value[r][c]
        const pulse = p ? Math.sin(t*4)*5 : 0

        ctx.value.shadowBlur = p ? 20 : 5
        ctx.value.shadowColor = p ? '#ff66ff' : '#aaa'

        ctx.value.fillStyle = p
          ? rgb(${150 + pulse}, 0, ${150 + pulse})
          : '#ddd'


        ctx.value.fillRect(x,y,CELL,CELL)

        ctx.value.shadowBlur = 0
      }
    }
  }

  drawBall(player.value,'#ff4444',t)

  particles.value.forEach((p,i)=>{
    p.update()
    p.draw(ctx.value)
    if(p.life<=0) particles.value.splice(i,1)
  })
}

const drawBall = (obj,color,tick)=>{
  const x = obj.c*CELL+CELL/2
  const y = obj.r*CELL+CELL/2

  const offsetY = Math.sin(tick*2)*3
  const offsetX = Math.sin(tick*1.5)*2
  const sizeOffset = 2 + Math.sin(tick*3)*1.5

  ctx.value.shadowBlur=25
  ctx.value.shadowColor=color

  ctx.value.fillStyle=color
  ctx.value.beginPath()
  ctx.value.arc(x+offsetX,y+offsetY,CELL/2-6+sizeOffset,0,Math.PI*2)
  ctx.value.fill()

  ctx.value.fillStyle='rgba(255,255,255,0.6)'
  ctx.value.beginPath()
  ctx.value.arc(x-6+offsetX,y-6+offsetY,6,0,Math.PI*2)
  ctx.value.fill()
  ctx.value.shadowBlur=0
}
const dirs = {
  ArrowUp:{dr:-1,dc:0},
  ArrowDown:{dr:1,dc:0},
  ArrowLeft:{dr:0,dc:-1},
  ArrowRight:{dr:0,dc:1}
}

const move = async (key)=>{
  if(!dirs[key] || won.value) return

  let {dr,dc}=dirs[key]
  let {r,c}=player.value

  while(true){
    let nr=r+dr,nc=c+dc
    if(nr<0||nr>=ROWS||nc<0||nc>=COLS||maze.value[nr][nc]===0) break

    r=nr; c=nc

    if(!painted.value[r][c]){
      painted.value[r][c]=true
      for(let i=0;i<10;i++){
        particles.value.push(new Particle(c*CELL+CELL/2,r*CELL+CELL/2))
      }
    }

    player.value={r,c}
    await new Promise(res=>setTimeout(res,35))
  }

  if(paintedCount.value===totalFloors.value){
    won.value=true
    setTimeout(nextLevel,800)
  }
}

const loadLevel = ()=>{
  maze.value = generateMaze()
  painted.value = Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  player.value = { r: 1, c: 1 }
  particles.value = []
  won.value = false
  startTimer()
}

const nextLevel = ()=>{
  level.value++
  loadLevel()
}

const resetLevel = ()=>{
  painted.value = Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  player.value = { r: 1, c: 1 }
  particles.value = []
  won.value = false
  startTimer()
}

const startTimer = ()=>{
  clearInterval(timerInterval)
  time.value=0
  timerInterval=setInterval(()=>time.value++,1000)
}

const loop = ()=>{
  draw()
  requestAnimationFrame(loop)
}

const handleKey = e => move(e.key)

onMounted(()=>{
  canvas.value.width=COLS*CELL
  canvas.value.height=ROWS*CELL
  ctx.value=canvas.value.getContext('2d')

  loadLevel()
  window.addEventListener('keydown',handleKey)
  loop()
})

onUnmounted(()=>{
  window.removeEventListener('keydown',handleKey)
  clearInterval(timerInterval)
})
</script>

<style scoped>
.game-container{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  min-height:100vh;
  background:#111;
  color:#fff;
  padding:25px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1{
  font-size:2rem;
  color:#ff66ff;
  margin-bottom:15px;
  text-shadow:0 0 10px #ff44ff;
}

.stats{
  display:flex;
  gap:40px;
  margin-bottom:20px;
}

.canvas-wrapper{
  display:flex;
  justify-content:center;
  align-items:center;
  padding:20px;
  border-radius:16px;
  background:#1a1a1a;
  box-shadow:0 10px 40px rgba(0,0,0,0.8);
}

canvas{
  display:block;
  border:6px solid #444;
  border-radius:12px;
}

button{
  width:220px;
  margin-top:20px;
  padding:12px;
  border:none;
  border-radius:10px;
  background: linear-gradient(135deg,#ff66ff,#cc00cc);
  color:white;
  font-weight:600;
  cursor:pointer;
}

.win-message{
  font-size:1.8rem;
  color:#00ffaa;
  margin-top:20px;
}
</style>