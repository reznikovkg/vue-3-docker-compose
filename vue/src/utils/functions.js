export const findAreaIndex = (x, y, areas, type, allTypes) => {
  return areas.findIndex(area => {
    if(area.type === type || allTypes) {
      const dx = x - area.x, dy = y - area.y
      return (dx * dx + dy * dy <= area.radius * area.radius)
    }
    return false
  })
}

export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getRandomOffset = (minDist, maxDist) => {
  let x, y
  do {
    x = getRandomInt(-maxDist, maxDist)
    y = getRandomInt(-maxDist, maxDist)
  } while(Math.abs(x) < minDist && Math.abs(y) < minDist)
  return {x: x, y: y}
}
