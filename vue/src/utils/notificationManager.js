import { NOTIFICATION_CONFIG } from './../config/gameConstants'

class NotificationManager {
  constructor() {
    this.lastNoBombsNotification = 0
    this.bombHintShown = false
  }

  showReward(count) {
    const notification = document.createElement('div')
    notification.textContent = `+${count} 💣`
    notification.className = 'bomb-notification bomb-notification__reward'
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), NOTIFICATION_CONFIG.rewardDuration)
  }

  showNoBombs() {
    const now = Date.now()
    if (now - this.lastNoBombsNotification < NOTIFICATION_CONFIG.noBombsCooldown) return
    
    this.lastNoBombsNotification = now

    const notification = document.createElement('div')
    notification.textContent = '❌ Нет бомб! Сделайте 10 успешных попаданий'
    notification.className = 'bomb-notification bomb-notification__error'
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (notification && notification.remove) {
        notification.remove()
      }
    }, NOTIFICATION_CONFIG.noBombsDuration)
  }

  showBombHint() {
    if (this.bombHintShown) return
    
    this.bombHintShown = true
    
    const hint = document.createElement('div')
    hint.innerHTML = '💣 <strong>Бомба готова!</strong> Зажми <kbd>B</kbd> и кликни, чтобы взорвать пузыри!'
    hint.className = 'bomb-notification bomb-notification__hint'
    document.body.appendChild(hint)
    
    setTimeout(() => {
      if (hint && hint.remove) {
        hint.remove()
      }
    }, NOTIFICATION_CONFIG.hintDuration)
  }

  reset() {
    this.lastNoBombsNotification = 0
    this.bombHintShown = false
  }
}

export default new NotificationManager()