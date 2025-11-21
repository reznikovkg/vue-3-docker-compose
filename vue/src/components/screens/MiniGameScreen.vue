<template>
 <div class="minigame-overlay" @click.self="closeMinigame">
   <div class="minigame-container">
     <h3>Quick Time Event</h3>
     <div class="progress-bar">
       <div
         class="progress-indicator"
         :style="{ left: indicatorPosition + 'px' }"
         @click="handleClick"
       ></div>
       <div class="target-zone" :style="{ left: targetZonePosition + 'px' }"></div>
     </div>
     <div class="hint">Click when the arrow is in the green zone!</div>
     <div v-if="showResult" :class="['result', isSuccess ? 'success' : 'fail']">
       {{ isSuccess ? 'Success!' : 'Try again!' }}
     </div>
     <button v-if="showResult" @click="resetMinigame">Try Again</button>
   </div>
 </div>
</template>


<script>
export default {
 name: 'MiniGame',
 props: {
   difficulty: {
     type: Number,
     default: 1, // 1-3, where 3 is hardest
     validator: value => value >= 1 && value <= 3
   },
   onComplete: {
     type: Function,
     required: true
   },
   onClose: {
     type: Function,
     required: true
   }
 },
 data() {
   return {
     indicatorPosition: 0,
     direction: 1,
     speed: 2,
     targetZonePosition: 0,
     targetZoneWidth: 0,
     isRunning: true,
     showResult: false,
     isSuccess: false,
     barWidth: 200,
     animationFrame: null
   };
 },
 computed: {
   indicatorWidth() {
     return 10; // Width of the indicator in pixels
   },
   zoneWidth() {
     // Adjust zone width based on difficulty
     return 40 - (this.difficulty * 8);
   }
 },
 mounted() {
   this.barWidth = this.$el.querySelector('.progress-bar').offsetWidth - this.indicatorWidth;
   this.targetZoneWidth = this.zoneWidth;
   this.targetZonePosition = this.getRandomPosition();
   this.animate();
 },
 beforeUnmount() {
   cancelAnimationFrame(this.animationFrame);
 },
 methods: {
   animate() {
     if (!this.isRunning) return;
    
     // Move indicator
     this.indicatorPosition += this.speed * this.direction;
    
     // Change direction at bounds
     if (this.indicatorPosition >= this.barWidth || this.indicatorPosition <= 0) {
       this.direction *= -1;
       this.indicatorPosition = Math.max(0, Math.min(this.indicatorPosition, this.barWidth));
     }
    
     this.animationFrame = requestAnimationFrame(this.animate);
   },
   getRandomPosition() {
     return Math.random() * (this.barWidth - this.zoneWidth);
   },
   handleClick() {
     if (!this.isRunning) return;
    
     this.isRunning = false;
     cancelAnimationFrame(this.animationFrame);
    
     // Check if click was in target zone
     const indicatorCenter = this.indicatorPosition + (this.indicatorWidth / 2);
     this.isSuccess = indicatorCenter >= this.targetZonePosition &&
                     indicatorCenter <= (this.targetZonePosition + this.zoneWidth);
    
     this.showResult = true;
    
     if (this.isSuccess) {
       setTimeout(() => {
         this.onComplete();
         this.onClose();
       }, 1000);
     }
   },
   resetMinigame() {
     this.indicatorPosition = 0;
     this.direction = 1;
     this.targetZonePosition = this.getRandomPosition();
     this.showResult = false;
     this.isRunning = true;
     this.animate();
   },
   closeMinigame() {
     this.onClose();
   }
 }
};
</script>


<style scoped>
.minigame-overlay {
 position: fixed;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background-color: rgba(0, 0, 0, 0.7);
 display: flex;
 justify-content: center;
 align-items: center;
 z-index: 1000;
}

.minigame-container {
 background: #2c3e50;
 padding: 2rem;
 border-radius: 8px;
 text-align: center;
 color: white;
 width: 300px;
}


.progress-bar {
 width: 100%;
 height: 30px;
 background-color: #34495e;
 position: relative;
 margin: 2rem 0;
 border-radius: 4px;
 overflow: hidden;
}

.progress-indicator {
 position: absolute;
 width: 10px;
 height: 100%;
 background-color: #3498db;
 cursor: pointer;
 transition: left 0.1s linear;
}

.progress-indicator:hover {
 background-color: #2980b9;
}

.target-zone {
 position: absolute;
 height: 100%;
 background-color: rgba(46, 204, 113, 0.3);
 border: 1px solid #2ecc71;
 top: 0;
}

.hint {
 margin: 1rem 0;
 color: #bdc3c7;
 font-size: 0.9rem;
}

button {
 margin-top: 1rem;
 padding: 0.5rem 1rem;
 background-color: #3498db;
 color: white;
 border: none;
 border-radius: 4px;
 cursor: pointer;
 transition: background-color 0.2s;
}

button:hover {
 background-color: #2980b9;
}

.result {
 margin: 1rem 0;
 font-weight: bold;
 font-size: 1.2rem;
}

.success {
 color: #2ecc71;
}

.fail {
 color: #e74c3c;
}
</style>
