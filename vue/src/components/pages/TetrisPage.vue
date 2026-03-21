<template>
  <div class="tetris-page">
    <h1 class="tetris-page__title">Тетрис</h1>

    <div class="tetris-page__game-area">
      <div
        ref="gameBoard"
        class="tetris-page__board"
      >
        <div
          v-for="(row, y) in displayBoard"
          :key="y"
          class="tetris-page__board-row"
        >
          <div
            v-for="(cell, x) in row"
            :key="`${y}-${x}-${cell}`"
            class="tetris-page__board-cell"
            :class="{
              'tetris-page__board-cell_filled': cell > 0,
              'tetris-page__board-cell_ghost': cell === GHOST_VALUE,
              'tetris-page__board-cell_steel': isSteelCell(cell, y, x)
            }"
            :style="cell > 0 ? getCellColor(cell) : {}"
          ></div>
        </div>
      </div>

      <div class="tetris-page__info-panel">
        <InfoPanel
          :next-piece-board="nextPieceBoard"
          :lines-cleared="linesCleared"
          :game-status="gameStatus"
          :get-cell-color="getCellColor"
          :difficulty="difficulty"
          :board-size="boardSize"
          :hard-mode-enabled="hardModeEnabled"
          @difficulty-changed="(val) => changeDifficulty(val)"
          @board-size-changed="(val) => changeBoardSize(val)"
          @hard-mode-toggle="(val) => toggleHardMode(val)"
        />
        <Controls
          :game-status="gameStatus"
          :actions="actions"
        />
      </div>
    </div>

    <div class="tetris-page__navigation">
      <RouterLink
        :to="{ name: $routes.INDEX }"
        class="tetris-page__nav-link"
      >
        To Index
      </RouterLink>
      <RouterLink
        :to="{ name: $routes.EXAMPLE }"
        class="tetris-page__nav-link"
      >
        To Example
      </RouterLink>
      <RouterLink
        :to="{ name: $routes.EDITOR }"
        class="tetris-page__nav-link"
      >Редактор фигур
      </RouterLink>
    </div>
  </div>
</template>


<script>
import { mapGetters } from 'vuex'
import InfoPanel from '../ui/InfoPanel.vue'
import Controls from '../ui/Controls.vue'
import {
  GHOST_VALUE,
  NEXT_PIECE_SIZE,
  GHOST_BACKGROUND,
  ERROR_COLOR,
  GAME_STATUS,
  DIFFICULTY,
  BASE_SPEEDS,
  BOARD_SIZES,
  STEEL_OVERLAY,
  BASE_PIECES
} from '@/constants/constants'

export default {
  name: 'TetrisPage',
  components: {
    InfoPanel,
    Controls
  },
  data () {
    return {
      board: [],
      currentPiece: null,
      nextPiece: null,
      currentX: 0,
      currentY: 0,
      linesCleared: 0,
      gameStatus: GAME_STATUS.IDLE,
      difficulty: DIFFICULTY.MEDIUM,
      boardSize: 'MEDIUM',
      hardModeEnabled: false,
      gameInterval: null,
      touchStartX: null,
      touchStartY: null,
      touchStartTime: null,
      LONG_PRESS_DURATION: 500,
      SWIPE_THRESHOLD: 30,
      GAME_STATUS,
      DIFFICULTY,
      GHOST_VALUE,
      GHOST_BACKGROUND,
      ERROR_COLOR,
      BASE_SPEEDS,
      STEEL_OVERLAY,
      BOARD_SIZES
    }
  },
  computed: {
    ...mapGetters('shapes', {
      allShapes: 'getAllShapes'
    }),

    canChangeSettings () {
      return this.gameStatus === GAME_STATUS.IDLE || this.gameStatus === GAME_STATUS.GAME_OVER
    },

    currentBoardDimensions () {
      return BOARD_SIZES[this.boardSize] || BOARD_SIZES.MEDIUM
    },

    currentBoardWidth () {
      return this.currentBoardDimensions.width
    },

    currentBoardHeight () {
      return this.currentBoardDimensions.height
    },

    actions () {
      return {
        movePieceLeft: () => this.movePieceLeft(),
        movePieceRight: () => this.movePieceRight(),
        rotateCurrentPiece: () => this.rotateCurrentPiece(),
        hardDropPiece: () => this.hardDropPiece(),
        toggleGamePause: () => this.toggleGamePause(),
        resetGame: () => this.resetGame()
      }
    },

    ghostY () {
      if (!this.currentPiece || this.gameStatus !== GAME_STATUS.PLAYING) {
        return this.currentY
      }
      let y = this.currentY
      while (!this.collision(this.currentPiece.shape, this.currentX, y + 1)) {
        y++
      }
      return y
    },

    displayBoard () {
      if (!this.board || !this.board.length) {
        return Array(this.currentBoardHeight).fill(0).map(() => Array(this.currentBoardWidth).fill(0))
      }
      
      const display = this.board.map(row => row.map(
        cell => (cell && cell.value > 0 ? cell.value : 0)
      ))

      if (this.currentPiece && this.currentPiece.shape && this.gameStatus === GAME_STATUS.PLAYING) {
        const piece = this.currentPiece
        const ghostYVal = this.ghostY
        const curX = this.currentX
        const curY = this.currentY

        piece.shape.forEach((row, y) => {          
          row.forEach((cell, x) => {
            if (cell > 0) {
              const boardY = ghostYVal + y
              const boardX = curX + x
              if (boardY >= 0 && boardY < this.currentBoardHeight && boardX >= 0 && boardX < this.currentBoardWidth) {
                if (display[boardY] && display[boardY][boardX] === 0) {
                  display[boardY][boardX] = GHOST_VALUE
                }
              }
            }
          })
        })

        piece.shape.forEach((row, y) => {          
          row.forEach((cell, x) => {
            if (cell > 0) {
              const boardY = curY + y
              const boardX = curX + x
              if (boardY >= 0 
                && boardY < this.currentBoardHeight 
                && boardX >= 0 
                && boardX < this.currentBoardWidth
                && display[boardY]) {
                display[boardY][boardX] = piece.colorId
              }
            }
          })
        })
      }

      return display
    },

    nextPieceBoard () {
      if (!this.nextPiece || !this.nextPiece.shape) {
        return Array(NEXT_PIECE_SIZE)
          .fill(0)
          .map(() => Array(NEXT_PIECE_SIZE).fill(0))
      }

      const result = Array(NEXT_PIECE_SIZE)
        .fill(0)
        .map(() => Array(NEXT_PIECE_SIZE).fill(0))

      this.nextPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell > 0) {
            result[y][x] = this.nextPiece.colorId
          }
        })
      })

      return result
    },
    
    baseInterval () {
      return BASE_SPEEDS[this.difficulty]
    },

    currentInterval () {
      const factor = 1 + this.linesCleared * 0.01
      return Math.max(this.baseInterval / factor, 50)
    }
  },
  methods: {
    extractNumber (id) {
      if (!id) {
        return null
      }
      const num = parseInt(id.replace(/\D/g, ''))
      return isNaN(num) ? null : num
    },

    createPiece (shapeData) {
      if (!shapeData) {
        return null
      }

      const isSteel = this.hardModeEnabled ? Math.random() < 0.2 : false
      const cells = shapeData.shape.map(row =>
        row.map(cell => cell === 0
          ? { isSteel: false, steelHit: false }
          : { isSteel, steelHit: false }
        )
      )
      
      const piece = {
        shape: shapeData.shape.map(row => [...row]),
        color: shapeData.color || '#FF0000',
        colorId: this.extractNumber(shapeData.id) ?? Math.floor(Math.random() * 1000000),
        id: shapeData.id || 'custom-' + Date.now(),
        cells: cells
      }
      
      return piece
    },

    getRandomPiece () {
      const shapes = this.allShapes
      if (!shapes || shapes.length === 0) {
        return this.createPiece(BASE_PIECES[0])
      }
      const randomIndex = Math.floor(Math.random() * shapes.length)
      return this.createPiece(shapes[randomIndex])
    },

    collision (shape, offsetX, offsetY) {
      if (!shape) {
        return true
      }
      return shape.some((row, y) =>
        row.some((cell, x) => {
          if (cell === 0) {
            return false
          }
          const boardX = offsetX + x
          const boardY = offsetY + y
          if (boardX < 0 
          || boardX >= this.currentBoardWidth 
          || boardY >= this.currentBoardHeight) {
            return true
          }
          if (boardY >= 0 
          && this.board[boardY] && this.board[boardY][boardX] && this.board[boardY][boardX].value !== 0) {
            return true
          }
          return false
        })
      )
    },

    initBoard () {
      this.board = Array(this.currentBoardHeight)
        .fill(0)
        .map((_, y) =>
          Array(this.currentBoardWidth)
            .fill(0)
            .map((_, x) => ({
              value: 0,
              color: null,
              colorId: null,
              isSteel: false,
              steelHit: false,
              cellId: `cell-${y}-${x}-${Date.now()}-${Math.random()}`
            }))
        )
    },

    setNextPiece (piece) {
      this.nextPiece = piece
    },

    setCurrentPiece (piece) {
      this.currentPiece = piece
    },

    setCurrentPosition (x, y) {
      this.currentX = x
      this.currentY = y
    },

    setGameStatus (status) {
      this.gameStatus = status
    },

    addLines (lines) {
      this.linesCleared += lines
      this.startGameLoop()
    },

    resetLines () {
      this.linesCleared = 0
    },

    mergePieceToBoard () {
      if (!this.currentPiece) {
        return
      }
      const piece = this.currentPiece
      const posX = this.currentX
      const posY = this.currentY

      if (!piece.shape || !piece.cells) {
        return
      }

      piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 0) {
            return
          }
          const boardY = posY + y
          const boardX = posX + x
          if (
            boardY < 0 &&
            boardY >= this.currentBoardHeight &&
            boardX < 0 &&
            boardX >= this.currentBoardWidth &&
            !this.board[boardY] &&
            !this.board[boardY][boardX] &&
            this.board[boardY][boardX].value !== 0
          ) {
            return
          }
          const cellData = piece.cells[y] && piece.cells[y][x] ? piece.cells[y][x] : { isSteel: false, steelHit: false }
          this.board[boardY][boardX] = {
            value: piece.colorId,
            color: piece.color,
            colorId: piece.colorId,
            isSteel: cellData.isSteel,
            steelHit: false,
            cellId: `cell-${boardY}-${boardX}-${Date.now()}-${Math.random()}`
          }
        })
      })
    },

    removeFullLines () {
      let linesRemoved = 0
      let y = 0;
      while (y < this.currentBoardHeight) {
        const line = this.board[y]
        if (!line) {
          y++
          continue
        }

        if (line.some(cell => cell && cell.value === 0)) {
          y++
          continue
        }

        const hasUntouchedSteel = line.some(cell => 
          cell.isSteel && !cell.steelHit
        )
        if (hasUntouchedSteel) {
          linesRemoved++
          line.forEach(cell => {
            if (cell.isSteel && !cell.steelHit) {
              cell.isSteel = false
              cell.steelHit = true
            } else {
              cell.value = 0
              cell.color = null
              cell.colorId = null
              cell.isSteel = false
              cell.steelHit = false
            }
          })
          y++
        } else {
          this.board.splice(y, 1)
          this.board.unshift(
            Array(this.currentBoardWidth).fill(0).map((_, x) => ({
              value: 0, color: null, colorId: null, isSteel: false, steelHit: false
            }))
          )
          linesRemoved++
        }
      }
      if (linesRemoved > 0) {
        this.addLines(linesRemoved)
      }
    },
    spawnNewPiece () {
      if (!this.nextPiece) {
        this.setNextPiece(this.getRandomPiece())
      }

      const nextPieceCopy = JSON.parse(JSON.stringify(this.nextPiece))
      this.setCurrentPiece(nextPieceCopy)
      this.setNextPiece(this.getRandomPiece())

      if (this.currentPiece && this.currentPiece.shape) {
        const newX = Math.floor((this.currentBoardWidth - (this.currentPiece.shape[0]?.length || 0)) / 2)
        this.setCurrentPosition(newX, 0)

      if (this.currentPiece
        && this.collision(this.currentPiece.shape, this.currentX, this.currentY)) {
        this.setGameStatus(GAME_STATUS.GAME_OVER)
        if (this.gameInterval) {
          clearInterval(this.gameInterval)
          this.gameInterval = null
          }
        }
      }
    },

    initGame () {
      this.initBoard()
      this.setNextPiece(this.getRandomPiece())
      this.spawnNewPiece()
      this.resetLines()
      this.setGameStatus(GAME_STATUS.IDLE)
    },

    movePieceLeft () {
      if (!this.currentPiece || this.gameStatus !== GAME_STATUS.PLAYING) {
        return
      }
      if (!this.collision(this.currentPiece.shape, this.currentX - 1, this.currentY)) {
        this.setCurrentPosition(this.currentX - 1, this.currentY)
      }
    },

    movePieceRight () {
      if (!this.currentPiece || this.gameStatus !== GAME_STATUS.PLAYING) {
        return
      }
      if (!this.collision(this.currentPiece.shape, this.currentX + 1, this.currentY)) {
        this.setCurrentPosition(this.currentX + 1, this.currentY)
      }
    },

    rotateCurrentPiece () {
      if (!this.currentPiece || !this.currentPiece.shape || !this.currentPiece.cells || this.gameStatus !== GAME_STATUS.PLAYING) {
        return
      }

      const rotated = this.currentPiece.shape[0].map((_, index) =>
        this.currentPiece.shape.map(row => row[index]).reverse()
      )

      const rotatedCells = this.currentPiece.cells[0].map((_, index) =>
        this.currentPiece.cells.map(row => row[index]).reverse()
      )

      if (!this.collision(rotated, this.currentX, this.currentY)) {
        this.setCurrentPiece({
          ...this.currentPiece,
          shape: rotated,
          cells: rotatedCells
        })
      } else {
        if (!this.collision(rotated, this.currentX - 1, this.currentY)) {
          this.setCurrentPiece({
            ...this.currentPiece,
            shape: rotated,
            cells: rotatedCells
          })
          this.setCurrentPosition(this.currentX - 1, this.currentY)
        } else if (!this.collision(rotated, this.currentX + 1, this.currentY)) {
          this.setCurrentPiece({
            ...this.currentPiece,
            shape: rotated,
            cells: rotatedCells
          })
          this.setCurrentPosition(this.currentX + 1, this.currentY)
        }
      }
    },

    movePieceDown () {
      if (!this.currentPiece || this.gameStatus !== GAME_STATUS.PLAYING) {
        return
      }

      if (!this.collision(this.currentPiece.shape, this.currentX, this.currentY + 1)) {
        this.setCurrentPosition(this.currentX, this.currentY + 1)
      } else {
        this.mergePieceToBoard()
        this.removeFullLines()
        this.spawnNewPiece()
      }
    },

    softDrop () {
      if (!this.currentPiece || this.gameStatus !== GAME_STATUS.PLAYING) {
        return
      }
      this.movePieceDown()
    },

    hardDropPiece () {
      if (!this.currentPiece || this.gameStatus !== GAME_STATUS.PLAYING) {
        return
      }

      let y = this.currentY
      while (!this.collision(this.currentPiece.shape, this.currentX, y + 1)) {
        y++
      }
      this.setCurrentPosition(this.currentX, y)
      this.mergePieceToBoard()
      this.removeFullLines()
      this.spawnNewPiece()
    },

    toggleGamePause () {
      if (this.gameStatus === GAME_STATUS.PLAYING) {
        this.setGameStatus(GAME_STATUS.PAUSED)
        if (this.gameInterval) {
          clearInterval(this.gameInterval)
          this.gameInterval = null
        }
      } else if (this.gameStatus === GAME_STATUS.PAUSED) {
        this.setGameStatus(GAME_STATUS.PLAYING)
        this.startGameLoop()
      } else if (this.gameStatus === GAME_STATUS.IDLE) {
        this.setGameStatus(GAME_STATUS.PLAYING)
        this.startGameLoop()
      } else if (this.gameStatus === GAME_STATUS.GAME_OVER) {
        this.initGame()
        this.setGameStatus(GAME_STATUS.PLAYING)
        this.startGameLoop()
      }
    },

    changeDifficulty (value) {
      if (this.canChangeSettings) {
        this.difficulty = value
        this.initGame()
      }
    },

    changeBoardSize (size) {
      if (this.canChangeSettings) {
        this.boardSize = size
        this.initGame()
      }
    },

    toggleHardMode (enabled) {
      if (this.canChangeSettings) {
        this.hardModeEnabled = enabled
        this.initGame()
      }
    },

    resetGame () {
      if (this.gameInterval) {
        clearInterval(this.gameInterval)
        this.gameInterval = null
      }
      this.initGame()
    },

    startGameLoop () {
      if (this.gameInterval) {
        clearInterval(this.gameInterval)
      }

      this.gameInterval = setInterval(() => {
        if (this.gameStatus === GAME_STATUS.PLAYING) {
          this.movePieceDown()
        }
      }, this.currentInterval)
    },

    getCellColor (colorId) {
      if (colorId === GHOST_VALUE) {
        return { backgroundColor: GHOST_BACKGROUND }
      }

      const cell = this.board.flat().find(c => c && c.colorId === colorId)
      if (cell) {
        return { backgroundColor: cell.color }
      }

      if (this.currentPiece && this.currentPiece.colorId === colorId) {
        return { backgroundColor: this.currentPiece.color }
      }
      
      if (this.nextPiece && this.nextPiece.colorId === colorId) {
        return { backgroundColor: this.nextPiece.color }
      }

      return { backgroundColor: ERROR_COLOR }
    },

    isSteelCell (colorId, y, x) {
      if (colorId === GHOST_VALUE || colorId <= 0) {
        return false
      }
      const boardCell = this.board[y]?.[x]
      if (boardCell && boardCell.colorId === colorId) {
        return boardCell.isSteel && !boardCell.steelHit
      }

      if (this.currentPiece && this.currentPiece.colorId === colorId) {
        const pieceY = y - this.currentY
        const pieceX = x - this.currentX
        if (pieceY >= 0 && pieceY < this.currentPiece.shape.length &&
            pieceX >= 0 && pieceX < this.currentPiece.shape[0].length) {
          const cellData = this.currentPiece.cells[pieceY]?.[pieceX]
          return cellData ? cellData.isSteel && !cellData.steelHit : false
        }
      }
      return false
    },

    handleTouchStart (e) {
      e.preventDefault()
      const touch = e.touches[0]
      this.touchStartX = touch.clientX
      this.touchStartY = touch.clientY
      this.touchStartTime = Date.now()
    },

    handleTouchEnd (e) {
      e.preventDefault()
      if (!this.touchStartX || !this.touchStartY || !this.touchStartTime) {
        return
      }

      const touchEnd = e.changedTouches[0]
      const deltaX = touchEnd.clientX - this.touchStartX
      const deltaY = touchEnd.clientY - this.touchStartY
      const touchDuration = Date.now() - this.touchStartTime

      if (touchDuration > this.LONG_PRESS_DURATION && Math.abs(deltaX) < this.SWIPE_THRESHOLD && Math.abs(deltaY) < this.SWIPE_THRESHOLD) {
        this.hardDropPiece()
      } else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.SWIPE_THRESHOLD) {
        if (deltaX > 0) {
          this.movePieceRight()
        } else {
          this.movePieceLeft()
        }
      } else if (Math.abs(deltaY) > this.SWIPE_THRESHOLD) {
        if (deltaY > 0) {
          this.softDrop()
        }
      }

      this.touchStartX = null
      this.touchStartY = null
      this.touchStartTime = null
    },

    handleTouchMove (e) {
      e.preventDefault()
    }
  },
  mounted () {
    this.initGame()
    const gameBoard = this.$refs.gameBoard
    if (gameBoard) {
      gameBoard.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false })
      gameBoard.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false })
      gameBoard.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false })
    }
  },
  beforeUnmount () {
    if (this.gameInterval) {
      clearInterval(this.gameInterval)
      this.gameInterval = null
    }
    const gameBoard = this.$refs.gameBoard
    if (gameBoard) {
      gameBoard.removeEventListener('touchstart', this.handleTouchStart)
      gameBoard.removeEventListener('touchend', this.handleTouchEnd)
      gameBoard.removeEventListener('touchmove', this.handleTouchMove)
    }
  }
}
</script>

<style scoped lang="scss">
.tetris-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__title {
    text-align: center;
    color: #ffffff;
    margin-bottom: 30px;
    font-size: 36px;

    @media (max-width: 768px) {
      font-size: 28px;
      margin-bottom: 20px;
    }

    @media (max-width: 480px) {
      font-size: 24px;
    }
  }

  &__game-area {
    display: flex;
    gap: 30px;
    justify-content: center;
    align-items: flex-start;
    flex: 1;

    @media (max-width: 900px) {
      gap: 20px;
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
  }

  &__board {
    background-color: #000000;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
    touch-action: none;
    -webkit-tap-highlight-color: transparent;

    @media (max-width: 768px) {
      padding: 8px;
    }

    @media (max-width: 480px) {
      padding: 5px;
    }
  }

  &__board-row {
    display: flex;
  }

  &__board-cell {
    width: 30px;
    height: 30px;
    border: 1px solid #333333;
    background-color: #000000;
    transition: background-color 0.1s;
    position: relative;

    @media (max-width: 1024px) {
      width: 30px;
      height: 30px;
    }

    @media (max-width: 900px) {
      width: 25px;
      height: 25px;
    }

    @media (max-width: 768px) {
      width: 30px;
      height: 30px;
    }

    @media (max-width: 480px) {
      width: 25px;
      height: 25px;
    }

    &_ghost {
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px dashed #666666;
    }

    &_steel::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.5));
      pointer-events: none;
    }
  }

  &__info-panel {
    min-width: 280px;
    width: 280px;
    padding: 20px;
    background-color: #1a1a1a;
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

    @media (max-width: 900px) {
      width: 250px;
    }

    @media (max-width: 768px) {
      width: 100%;
      max-width: 400px;
      padding: 15px;
    }

    @media (max-width: 480px) {
      padding: 10px;
    }
  }

  &__navigation {
    margin-top: 30px;
    text-align: center;
    display: flex;
    gap: 15px;
    justify-content: center;

    @media (max-width: 768px) {
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    @media (max-width: 480px) {
      gap: 8px;
    }
  }

  &__nav-link {
    display: inline-block;
    padding: 8px 16px;
    color: #ffffff;
    text-decoration: none;
    border: 1px solid #ffffff;
    border-radius: 4px;
    transition: all 0.3s;

    @media (max-width: 768px) {
      padding: 6px 12px;
      font-size: 14px;
    }

    @media (max-width: 480px) {
      padding: 5px 10px;
      font-size: 12px;
    }

    &:hover {
      background-color: #ffffff;
      color: #000000;
    }
  }
}
</style>
