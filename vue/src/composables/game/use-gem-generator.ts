import { ref } from "vue"
import { Gem } from "@/types"
import { GEM_COLORS, SWAP_DIRECTIONS } from "@/services/constants"

export const useGemGenerator = () => {
  const nextGemId = ref(1)

  const resetGemIds = (): void => {
    nextGemId.value = 1
  }
  const generateGemId = (): number => nextGemId.value++
  const getRandomGemType = () => (Math.floor(Math.random() * GEM_COLORS.length) + 1)
  const createGem = (row: number, col: number, isNew: boolean = false): Gem => {
    const type = getRandomGemType()
    return {
      id: generateGemId(),
      type,
      color: GEM_COLORS[type - 1],
      row,
      col,
      selected: false,
      removing: false,
      isNew,
      swapDirection: SWAP_DIRECTIONS.NONE
    }
  }

  return {
    nextGemId,

    resetGemIds,
    generateGemId,
    getRandomGemType,
    createGem,
  }
}
