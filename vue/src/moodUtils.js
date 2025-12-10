export const INDICATOR_TYPES = {
  FATIGUE: 'fatigue',
  HUNGER: 'hunger',
  BOREDOM: 'boredom',
  NATURAL_NEED: 'naturalNeed'
}

export const moodUtils = {
  calculateMoodValue(indicators) {
    if (!indicators) return 5
    
    const { FATIGUE, HUNGER, BOREDOM, NATURAL_NEED } = INDICATOR_TYPES
    
    const values = [
      indicators[FATIGUE] || 0,
      indicators[HUNGER] || 0,
      indicators[BOREDOM] || 0,
      indicators[NATURAL_NEED] || 0
    ]
    
    const average = values.reduce((sum, value) => sum + value, 0) / values.length
    return parseFloat(average.toFixed(1))
  },
  
  getCriticalIndicators(indicators, threshold = 3) {
    if (!indicators) return []
    
    const criticalIndicators = []
    
    Object.values(INDICATOR_TYPES).forEach(indicatorType => {
      if (indicators[indicatorType] < threshold) {
        criticalIndicators.push(indicatorType)
      }
    })
    
    return criticalIndicators
  },
  
  generateInitialIndicators() {
    const getRandomValue = () => Math.floor(Math.random() * 4) + 5
    
    return {
      [INDICATOR_TYPES.FATIGUE]: getRandomValue(),
      [INDICATOR_TYPES.HUNGER]: getRandomValue(),
      [INDICATOR_TYPES.BOREDOM]: getRandomValue(),
      [INDICATOR_TYPES.NATURAL_NEED]: getRandomValue()
    }
  },
  
  getIndicatorDisplayNames() {
    return [
      { key: INDICATOR_TYPES.FATIGUE, displayName: 'Усталость' },
      { key: INDICATOR_TYPES.HUNGER, displayName: 'Голод' },
      { key: INDICATOR_TYPES.BOREDOM, displayName: 'Скука' },
      { key: INDICATOR_TYPES.NATURAL_NEED, displayName: 'Нужда' }
    ]
  },
  
  getIndicatorDisplayName(indicatorKey) {
    const displayNames = {
      [INDICATOR_TYPES.FATIGUE]: 'Усталость',
      [INDICATOR_TYPES.HUNGER]: 'Голод',
      [INDICATOR_TYPES.BOREDOM]: 'Скука',
      [INDICATOR_TYPES.NATURAL_NEED]: 'Нужда'
    }
    return displayNames[indicatorKey] || indicatorKey
  },
  
  formatTooltip(person) {
    if (!person) return ''
    
    const indicators = person.indicators || {}
    const critical = person.criticalIndicators || []
    const indicatorDisplayNames = this.getIndicatorDisplayNames()
    
    let tooltip = `Настроение: ${person.mood?.toFixed(1) || '?'}/10\n`
    tooltip += `Баланс: ${person.balance}\n\n`
    
    indicatorDisplayNames.forEach(({ key, displayName }) => {
      const value = indicators[key] || 0
      const isCritical = critical.includes(key)
      tooltip += `${displayName}: ${value}${isCritical ? ' !' : ''}\n`
    })
    
    if (critical.length > 0) {
      tooltip += `\n!Критические показатели!`
    }
    
    return tooltip
  },
  
  getBorderColor(mood) {
    if (mood >= 7) return '#2E7D32'
    if (mood >= 4) return '#FF8F00'
    return '#C62828'
  }
} 