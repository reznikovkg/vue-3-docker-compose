import soundManager from './../utils/soundManager'
import CursorManager from './../utils/cursor/CursorManager'
import { preloadBubbleImages } from './../config/bubbles'
import { preloadBombSprite } from './../config/bombConfig'

class PreloadService {
  static preloaded = false

  static preloadAll() {
    if (PreloadService.preloaded) {
      return
    }
    
    this.preloadSounds()
    this.preloadCursors()
    this.preloadBubbleImages()
    this.preloadBombSprite()
    
    PreloadService.preloaded = true
  }

  static preloadSounds() {
    soundManager.preloadAll()
  }

  static preloadCursors() {
    CursorManager.preloadImages()
  }

  static preloadBubbleImages() {
    preloadBubbleImages()
  }

  static preloadBombSprite() {
    preloadBombSprite()
  }

  static reset() {
    PreloadService.preloaded = false
  }
}

export default PreloadService