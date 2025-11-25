import type { ShopItem, InventoryItem, TackleItem } from '@/types'
import { shopItems, tackleItems, tackleUpgrades } from '@/data/tackle'

const SELL_PRICE_MULTIPLIER = 0.7
const TACKLE_SELL_PRICE_MULTIPLIER = 0.5
const BAIT_BULK_QUANTITY = 10

interface ShopError extends Error {
  code?: string
  details?: unknown
}

const createShopError = (message: string, code?: string, details?: unknown): ShopError => {
  const error = new Error(message) as ShopError
  if (code) error.code = code
  if (details) error.details = details
  return error
}

export const shopModule = {
  namespaced: true,

  state: () => ({
    shopItems: shopItems,
    tackleItems: tackleItems,
    tackleUpgrades: tackleUpgrades
  }),

  getters: {
    availableItems: (state: any) => state.shopItems.filter((item: ShopItem) => item.type === 'tackle'),
    baitItems: (state: any) => state.shopItems.filter((item: ShopItem) => item.type === 'bait'),
    tackleUpgrades: (state: any) => state.tackleUpgrades,
    tackleItems: (state: any) => state.tackleItems,

    getItemById: (state: any) => (id: string) => {
      return state.shopItems.find((item: ShopItem) => item.id === id) ||
             state.tackleItems.find((item: TackleItem) => item.id === id) ||
             state.tackleUpgrades.find((item: ShopItem) => item.id === id)
    },

    getTackleByType: (state: any) => (type: string) => {
      return state.tackleItems.filter((item: TackleItem) => item.type === type)
    },

    getUpgradesForType: (state: any) => (type: string) => {
      return state.tackleUpgrades.filter((upgrade: ShopItem) =>
        upgrade.id.includes(type)
      )
    }
  },

  mutations: {
    ADD_TO_INVENTORY: (state: any, item: InventoryItem) => {
      const existingItem = state.inventory.find((i: InventoryItem) => i.id === item.id)
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        state.inventory.push({ ...item })
      }
    },

    REMOVE_FROM_INVENTORY: (state: any, payload: { itemId: string; quantity?: number }) => {
      const { itemId, quantity = 1 } = payload
      const itemIndex = state.inventory.findIndex((item: InventoryItem) => item.id === itemId)

      if (itemIndex !== -1) {
        if (state.inventory[itemIndex].quantity > quantity) {
          state.inventory[itemIndex].quantity -= quantity
        } else {
          state.inventory.splice(itemIndex, 1)
        }
      }
    },

    ADD_MONEY: (state: any, amount: number) => {
      state.money = Math.max(0, (state.money || 0) + amount)
    },

    SET_INVENTORY: (state: any, inventory: InventoryItem[]) => {
      state.inventory = inventory
    },

    UPGRADE_TACKLE: (state: any, payload: { itemId: string; upgrade: ShopItem }) => {
      const { itemId, upgrade } = payload
      const itemIndex = state.inventory.findIndex((item: InventoryItem) => item.id === itemId)

      if (itemIndex !== -1) {
        const item = state.inventory[itemIndex]
        if (upgrade.properties.strengthBonus) {
          item.properties.strengthBonus = (item.properties.strengthBonus || 0) + upgrade.properties.strengthBonus
        }
        if (upgrade.properties.level) {
          item.properties.level = upgrade.properties.level
        }
        if (upgrade.properties.level === 2) {
          item.name = item.name.replace('Простая', 'Продвинутая')
        } else if (upgrade.properties.level === 3) {
          item.name = item.name.replace('Продвинутая', 'Профессиональная')
        }
      }
    }
  },

  actions: {
    buyItem({ commit, dispatch, rootGetters }: any, { itemId, quantity = 1 }: { itemId: string; quantity: number }) {
      return new Promise((resolve) => {
        try {
          const item = rootGetters['shop/getItemById'](itemId)
          if (!item) {
            throw createShopError('Товар не найден', 'ITEM_NOT_FOUND', { itemId })
          }

          const currentMoney = rootGetters['fishing/money']
          const totalPrice = item.price * quantity

          if (itemId !== 'rod_basic' && currentMoney < totalPrice) {
            throw createShopError('Недостаточно денег', 'INSUFFICIENT_FUNDS', {
              currentMoney,
              required: totalPrice,
              difference: totalPrice - currentMoney
            })
          }

          if (itemId !== 'rod_basic') {
            dispatch('fishing/updateMoney', -totalPrice, { root: true }).then(() => {
              const inventoryItem: InventoryItem = {
                id: item.id,
                name: item.name,
                type: item.type === 'bait' ? 'bait' : 'tackle',
                quantity,
                price: item.price,
                emoji: item.type === 'bait' ? '🪱' : '🎣',
                properties: item.properties || {}
              }

              dispatch('fishing/addToInventory', inventoryItem, { root: true }).then(() => {
                resolve({ success: true, message: 'Товар успешно куплен!' })
              })
            })
          } else {
            const inventoryItem: InventoryItem = {
              id: item.id,
              name: item.name,
              type: 'tackle',
              quantity,
              price: item.price,
              emoji: '🎣',
              properties: item.properties || {}
            }

            dispatch('fishing/addToInventory', inventoryItem, { root: true }).then(() => {
              resolve({ success: true, message: 'Товар успешно куплен!' })
            })
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при покупке'
          resolve({ success: false, message: errorMessage })
        }
      })
    },

    sellFish({ commit, dispatch, rootGetters }: any, { fishId, quantity = 1 }: { fishId: string; quantity?: number }) {
      return new Promise((resolve) => {
        try {
          const fishForSale = rootGetters['fishing/availableFishForSale']
          const fish = fishForSale.find((f: any) => f.inventoryId === fishId)

          if (!fish) {
            throw createShopError('Рыба не найдена в инвентаре', 'FISH_NOT_FOUND', { fishId })
          }

          const sellPrice = Math.floor(fish.price * SELL_PRICE_MULTIPLIER * quantity)

          dispatch('fishing/removeFishFromSale', fishId, { root: true }).then(() => {
            dispatch('fishing/updateMoney', sellPrice, { root: true }).then(() => {
              resolve({
                success: true,
                message: `Продано ${quantity} шт. за ${sellPrice} ₽`,
                amount: sellPrice
              })
            })
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при продаже рыбы'
          resolve({ success: false, message: errorMessage })
        }
      })
    },

    sellAllFish({ commit, dispatch, rootGetters }: any) {
      return new Promise((resolve) => {
        try {
          const fishForSale = rootGetters['fishing/availableFishForSale']

          if (fishForSale.length === 0) {
            resolve({ success: false, message: 'Нет рыбы для продажи' })
            return
          }

          let totalAmount = 0
          const soldItems: Array<{name: string, quantity: number, amount: number}> = []

          const removePromises = fishForSale.map((fish: any) => {
            return new Promise((resolveRemove) => {
              const sellPrice = Math.floor(fish.price * SELL_PRICE_MULTIPLIER)
              totalAmount += sellPrice
              soldItems.push({
                name: fish.name,
                quantity: 1,
                amount: sellPrice
              })

              dispatch('fishing/removeFishFromSale', fish.inventoryId, { root: true }).then(() => {
                resolveRemove(true)
              })
            })
          })

          Promise.all(removePromises).then(() => {
            dispatch('fishing/updateMoney', totalAmount, { root: true }).then(() => {
              resolve({
                success: true,
                message: `Продана вся рыба за ${totalAmount} ₽`,
                amount: totalAmount,
                soldItems
              })
            })
          })

        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при продаже всей рыбы'
          resolve({ success: false, message: errorMessage })
        }
      })
    },

    sellTackle({ commit, dispatch, rootGetters }: any, { itemId, quantity = 1 }: { itemId: string; quantity?: number }) {
      return new Promise((resolve) => {
        try {
          const inventory = rootGetters['fishing/inventory']
          const tackle = inventory.find((item: InventoryItem) => item.id === itemId && (item.type === 'tackle' || item.type === 'bait'))

          if (!tackle) {
            throw createShopError('Снасть не найдена в инвентаре', 'TACKLE_NOT_FOUND', { itemId })
          }

          if (tackle.quantity < quantity) {
            throw createShopError('Недостаточно снастей для продажи', 'INSUFFICIENT_QUANTITY', {
              available: tackle.quantity,
              requested: quantity
            })
          }

          if (itemId === 'rod_basic') {
            throw createShopError('Базовую удочку нельзя продать', 'ROD_BASIC_UNSELLABLE')
          }

          const sellPrice = Math.floor(tackle.price * TACKLE_SELL_PRICE_MULTIPLIER * quantity)

          dispatch('fishing/removeFromInventory', { itemId, quantity }, { root: true }).then(() => {
            dispatch('fishing/updateMoney', sellPrice, { root: true }).then(() => {
              resolve({
                success: true,
                message: `Снасть продана за ${sellPrice} ₽`,
                amount: sellPrice
              })
            })
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при продаже снасти'
          resolve({ success: false, message: errorMessage })
        }
      })
    },

    useBait({ commit, dispatch, rootGetters }: any, baitId: string) {
      return new Promise((resolve) => {
        try {
          const inventory = rootGetters['fishing/inventory']
          const bait = inventory.find((item: InventoryItem) => item.id === baitId && item.type === 'bait')

          if (!bait || bait.quantity === 0) {
            throw createShopError('Наживка не найдена', 'BAIT_NOT_FOUND')
          }

          dispatch('fishing/removeFromInventory', { itemId: baitId, quantity: 1 }, { root: true }).then(() => {
            resolve({ success: true, message: 'Наживка использована' })
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при использовании наживки'
          resolve({ success: false, message: errorMessage })
        }
      })
    },

    buyAndEquipTackle({ dispatch }: any, { itemId, type }: { itemId: string; type: string }) {
      return new Promise((resolve) => {
        dispatch('buyItem', { itemId, quantity: 1 }).then((purchaseResult: any) => {
          if (!purchaseResult.success) {
            resolve({ success: false, message: purchaseResult.message })
            return
          }

          dispatch('fishing/equipTackle', { type, itemId }, { root: true }).then(() => {
            resolve({ success: true, message: 'Снасть куплена и экипирована!' })
          })
        })
      })
    },

    upgradeTackle({ commit, dispatch, rootGetters }: any, { itemId, upgradeId }: { itemId: string; upgradeId: string }) {
      return new Promise((resolve) => {
        try {
          const upgrade = rootGetters['shop/getItemById'](upgradeId)
          if (!upgrade) {
            throw createShopError('Улучшение не найдено', 'UPGRADE_NOT_FOUND')
          }

          const currentMoney = rootGetters['fishing/money']
          if (currentMoney < upgrade.price) {
            throw createShopError('Недостаточно денег для улучшения', 'INSUFFICIENT_FUNDS')
          }

          const inventory = rootGetters['fishing/inventory']
          const itemToUpgrade = inventory.find((item: InventoryItem) => item.id === itemId)
          if (!itemToUpgrade) {
            throw createShopError('Снасть для улучшения не найдена', 'ITEM_NOT_FOUND')
          }

          const currentLevel = itemToUpgrade.properties?.level || 1
          const upgradeLevel = upgrade.properties?.level || 2

          if (upgradeLevel <= currentLevel) {
            throw createShopError('Снасть уже имеет этот уровень или выше', 'ALREADY_UPGRADED')
          }

          dispatch('fishing/updateMoney', -upgrade.price, { root: true }).then(() => {
            commit('UPGRADE_TACKLE', { itemId, upgrade })

            dispatch('fishing/saveGameState', null, { root: true }).then(() => {
              resolve({
                success: true,
                message: `Снасть улучшена до уровня ${upgradeLevel}!`
              })
            })
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при улучшении снасти'
          resolve({ success: false, message: errorMessage })
        }
      })
    },

    buyBaitInBulk({ dispatch }: any, { itemId, quantity = BAIT_BULK_QUANTITY }: { itemId: string; quantity: number }) {
      return dispatch('buyItem', { itemId, quantity })
    },

    sellAllTackleByType({ dispatch, rootGetters }: any, type: string) {
      return new Promise((resolve) => {
        try {
          const inventory = rootGetters['fishing/inventory']
          const tackleToSell = inventory.filter((item: InventoryItem) =>
            item.type === 'tackle' && item.id.includes(type) && item.id !== 'rod_basic'
          )

          if (tackleToSell.length === 0) {
            throw createShopError(`Нет снастей типа ${type} для продажи`, 'NO_TACKLE_FOR_TYPE')
          }

          let totalAmount = 0
          const soldItems: Array<{name: string, quantity: number, amount: number}> = []

          const sellPromises = tackleToSell.map((tackle: InventoryItem) => {
            return new Promise((resolveSell) => {
              const sellPrice = Math.floor(tackle.price * TACKLE_SELL_PRICE_MULTIPLIER * tackle.quantity)
              totalAmount += sellPrice
              soldItems.push({
                name: tackle.name,
                quantity: tackle.quantity,
                amount: sellPrice
              })

              dispatch('fishing/removeFromInventory', {
                itemId: tackle.id,
                quantity: tackle.quantity
              }, { root: true }).then(() => {
                resolveSell(true)
              })
            })
          })

          Promise.all(sellPromises).then(() => {
            dispatch('fishing/updateMoney', totalAmount, { root: true }).then(() => {
              resolve({
                success: true,
                message: `Проданы все снасти типа ${type} за ${totalAmount} ₽`,
                amount: totalAmount,
                soldItems
              })
            })
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при продаже снастей по типу'
          resolve({ success: false, message: errorMessage })
        }
      })
    },

    getAvailableUpgrades({ rootGetters }: any, itemId: string) {
      const inventory = rootGetters['fishing/inventory']
      const item = inventory.find((item: InventoryItem) => item.id === itemId)

      if (!item) {
        return []
      }

      const currentLevel = item.properties?.level || 1
      const upgrades = rootGetters['shop/tackleUpgrades']

      return upgrades.filter((upgrade: ShopItem) => {
        const upgradeLevel = upgrade.properties?.level || 2
        return upgradeLevel > currentLevel && upgrade.id.includes(item.id.split('_')[0])
      })
    },

    buyBestAvailableTackle({ dispatch, rootGetters }: any, type: string) {
      return new Promise((resolve) => {
        try {
          const availableItems = rootGetters['shop/availableItems']
          const baitItems = rootGetters['shop/baitItems']
          const allItems = [...availableItems, ...baitItems]

          const itemsOfType = allItems.filter((item: ShopItem) =>
            item.id.includes(type)
          ).sort((a: ShopItem, b: ShopItem) => b.price - a.price)

          let purchasedItem = null

          const tryPurchase = (index: number) => {
            if (index >= itemsOfType.length) {
              resolve({ success: false, message: 'Не удалось купить ни одну снасть этого типа' })
              return
            }

            const item = itemsOfType[index]
            dispatch('buyItem', { itemId: item.id, quantity: 1 }).then((result: any) => {
              if (result.success) {
                purchasedItem = item
                const itemType = purchasedItem.type === 'bait' ? 'bait' : type
                dispatch('fishing/equipTackle', {
                  type: itemType,
                  itemId: purchasedItem.id
                }, { root: true }).then(() => {
                  resolve({
                    success: true,
                    message: `Куплена и экипирована ${purchasedItem.name}!`
                  })
                })
              } else {
                tryPurchase(index + 1)
              }
            })
          }

          tryPurchase(0)
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при покупке лучшей снасти'
          resolve({ success: false, message: errorMessage })
        }
      })
    }
  }
}