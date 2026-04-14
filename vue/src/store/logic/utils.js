export const canPlaceShape = ({ shape, origin, occupiedMap, width, height }) => shape.cells.every(cell => {
    const x = origin.x + cell.x
    const y = origin.y + cell.y

    if (x < 0 || y < 0 || x >= width || y >= height) {
        return false
    }

    return !occupiedMap.has(`${x}-${y}`)
});