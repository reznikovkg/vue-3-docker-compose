import type { ShopItem, InventoryItem, TackleItem, GroundbaitType, NetItem } from '@/types'
import { shopItems, tackleItems, tackleUpgrades } from '@/data/tackle'

const SELL_PRICE_MULTIPLIER = 0.7
const TACKLE_SELL_PRICE_MULTIPLIER = 0.5
const BAIT_BULK_QUANTITY = 10
const NET_SELL_PRICE_MULTIPLIER = 0.6

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

const getGroundbaitEmoji = (groundbaitId: string): string => {
  const emojis: Record<string, string> = {
    'groundbait_basic': '🍚',
    'groundbait_advanced': '🥣',
    'groundbait_pro': '🎯',
    'groundbait_special': '🌊'
  }
  return emojis[groundbaitId] || '🍚'
}

const getNetEmoji = (): string => {
  return '🎯'
}

export const shopModule = {
  namespaced: true,

  state: () => ({
    shopItems: shopItems,
    tackleItems: tackleItems,
    tackleUpgrades: tackleUpgrades,
    inventory: [],
    money: 1000
  }),

  getters: {
    availableItems: (state: any) => state.shopItems.filter((item: ShopItem) => item.type === 'tackle'),
    baitItems: (state: any) => state.shopItems.filter((item: ShopItem) => item.type === 'bait'),
    tackleUpgrades: (state: any) => state.tackleUpgrades,
    tackleItems: (state: any) => state.tackleItems,
    netItems: (state: any) => state.shopItems.filter((item: ShopItem) => item.type === 'net'),

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
    },

    groundbaitItems: (state: any) => state.shopItems.filter((item: ShopItem) => item.type === 'groundbait'),
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
        const item = rootGetters['shop/getItemById'](itemId)
        if (!item) {
          resolve({ success: false, message: 'Товар не найден' })
          return
        }

        const currentMoney = rootGetters['fishing/money']
        const totalPrice = item.price * quantity

        if (itemId !== 'rod_basic' && currentMoney < totalPrice) {
          resolve({ success: false, message: 'Недостаточно денег' })
          return
        }

        if (itemId !== 'rod_basic') {
          dispatch('fishing/updateMoney', -totalPrice, { root: true }).then(() => {
            let inventoryItem: InventoryItem

            if (item.type === 'groundbait') {
              inventoryItem = {
                id: item.id,
                name: item.name,
                type: 'groundbait',
                quantity,
                price: item.price,
                emoji: getGroundbaitEmoji(item.id),
                properties: {
                  ...item.properties,
                  level: item.properties?.level || 1,
                  maxLevel: 5,
                  radius: item.properties?.radius || 15,
                  uses: item.properties?.uses || 3,
                  maxUses: item.properties?.uses || 3,
                  fishAttraction: item.properties?.fishAttraction || [],
                  color: item.properties?.color || '#8BC34A'
                }
              }

              const groundbaitType: GroundbaitType = {
                id: item.id,
                name: item.name,
                description: item.description,
                level: item.properties?.level || 1,
                maxLevel: 5,
                price: item.price,
                radius: item.properties?.radius || 15,
                uses: item.properties?.uses || 3,
                maxUses: item.properties?.uses || 3,
                fishAttraction: item.properties?.fishAttraction || [],
                color: item.properties?.color || '#8BC34A',
                emoji: getGroundbaitEmoji(item.id)
              }

              dispatch('fishing/addToInventory', inventoryItem, { root: true }).then(() => {
                return dispatch('fishing/addAvailableGroundbait', groundbaitType, { root: true })
              }).then(() => {
                resolve({
                  success: true,
                  message: 'Прикормка куплена!',
                  item: inventoryItem
                })
              })
            } else if (item.type === 'net') {
              inventoryItem = {
                id: item.id,
                name: item.name,
                type: 'net',
                quantity,
                price: item.price,
                emoji: getNetEmoji(),
                properties: {
                  strengthBonus: item.properties?.strengthBonus || 0,
                  level: item.properties?.level || 1,
                  maxWeight: item.properties?.maxWeight || 3,
                  durability: item.properties?.durability || 100,
                  uses: item.properties?.uses || 10,
                  usesLeft: item.properties?.uses || 10,
                  maxUses: item.properties?.uses || 10
                }
              }

              dispatch('fishing/addToInventory', inventoryItem, { root: true }).then(() => {
                const equippedNet = rootGetters['fishing/equippedNet']
                if (!equippedNet || equippedNet.usesLeft <= 0) {
                  return dispatch('fishing/equipNet', item.id, { root: true })
                }
                return Promise.resolve()
              }).then(() => {
                resolve({
                  success: true,
                  message: `Сачок "${item.name}" куплен!`,
                  item: inventoryItem
                })
              })
            } else {
              inventoryItem = {
                id: item.id,
                name: item.name,
                type: item.type,
                quantity,
                price: item.price,
                emoji: item.type === 'bait' ? '🪱' : '🎣',
                properties: item.properties || {}
              }

              dispatch('fishing/addToInventory', inventoryItem, { root: true }).then(() => {
                resolve({
                  success: true,
                  message: 'Товар успешно куплен!',
                  item: inventoryItem
                })
              })
            }
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
            resolve({
              success: true,
              message: 'Товар успешно куплен!',
              item: inventoryItem
            })
          })
        }
      })
    },

    sellFish({ commit, dispatch, rootGetters }: any, { fishId, quantity = 1 }: { fishId: string; quantity?: number }) {
      return new Promise((resolve) => {
        const fishForSale = rootGetters['fishing/availableFishForSale']
        const fish = fishForSale.find((f: any) => f.inventoryId === fishId)

        if (!fish) {
          resolve({ success: false, message: 'Рыба не найдена в инвентаре' })
          return
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
      })
    },

    sellAllFish({ commit, dispatch, rootGetters }: any) {
      return new Promise((resolve) => {
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
      })
    },

    sellTackle({ commit, dispatch, rootGetters }: any, { itemId, quantity = 1 }: { itemId: string; quantity?: number }) {
      return new Promise((resolve) => {
        const inventory = rootGetters['fishing/inventory']
        const tackle = inventory.find((item: InventoryItem) =>
          item.id === itemId && (item.type === 'tackle' || item.type === 'bait' || item.type === 'net')
        )

        if (!tackle) {
          resolve({ success: false, message: 'Снасть не найдена в инвентаре' })
          return
        }

        if (tackle.quantity < quantity) {
          resolve({ success: false, message: 'Недостаточно снастей для продажи' })
          return
        }

        if (itemId === 'rod_basic') {
          resolve({ success: false, message: 'Базовую удочку нельзя продать' })
          return
        }

        let sellMultiplier = TACKLE_SELL_PRICE_MULTIPLIER
        if (tackle.type === 'net') {
          sellMultiplier = NET_SELL_PRICE_MULTIPLIER
        }

        const sellPrice = Math.floor(tackle.price * sellMultiplier * quantity)

        dispatch('fishing/removeFromInventory', { itemId, quantity }, { root: true }).then(() => {
          dispatch('fishing/updateMoney', sellPrice, { root: true }).then(() => {
            resolve({
              success: true,
              message: `Снасть продана за ${sellPrice} ₽`,
              amount: sellPrice
            })
          })
        })
      })
    },

    sellNet({ dispatch }: any, { netId, quantity = 1 }: { netId: string; quantity?: number }) {
      return dispatch('sellTackle', { itemId: netId, quantity })
    },

    useBait({ commit, dispatch, rootGetters }: any, baitId: string) {
      return new Promise((resolve) => {
        const inventory = rootGetters['fishing/inventory']
        const bait = inventory.find((item: InventoryItem) => item.id === baitId && item.type === 'bait')

        if (!bait || bait.quantity === 0) {
          resolve({ success: false, message: 'Наживка не найдена' })
          return
        }

        dispatch('fishing/removeFromInventory', { itemId: baitId, quantity: 1 }, { root: true }).then(() => {
          resolve({ success: true, message: 'Наживка использована' })
        })
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

    buyAndEquipNet({ dispatch }: any, netId: string) {
      return new Promise((resolve) => {
        dispatch('buyItem', { itemId: netId, quantity: 1 }).then((purchaseResult: any) => {
          if (!purchaseResult.success) {
            resolve({ success: false, message: purchaseResult.message })
            return
          }

          dispatch('fishing/equipNet', netId, { root: true }).then(() => {
            resolve({ success: true, message: 'Сачок куплен и экипирован!' })
          })
        })
      })
    },

    upgradeTackle({ commit, dispatch, rootGetters }: any, { itemId, upgradeId }: { itemId: string; upgradeId: string }) {
      return new Promise((resolve) => {
        const upgrade = rootGetters['shop/getItemById'](upgradeId)
        if (!upgrade) {
          resolve({ success: false, message: 'Улучшение не найдено' })
          return
        }

        const currentMoney = rootGetters['fishing/money']
        if (currentMoney < upgrade.price) {
          resolve({ success: false, message: 'Недостаточно денег для улучшения' })
          return
        }

        const inventory = rootGetters['fishing/inventory']
        const itemToUpgrade = inventory.find((item: InventoryItem) => item.id === itemId)
        if (!itemToUpgrade) {
          resolve({ success: false, message: 'Снасть для улучшения не найдена' })
          return
        }

        const currentLevel = itemToUpgrade.properties?.level || 1
        const upgradeLevel = upgrade.properties?.level || 2

        if (upgradeLevel <= currentLevel) {
          resolve({ success: false, message: 'Снасть уже имеет этот уровень или выше' })
          return
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
      })
    },

    buyBaitInBulk({ dispatch }: any, { itemId, quantity = BAIT_BULK_QUANTITY }: { itemId: string; quantity: number }) {
      return dispatch('buyItem', { itemId, quantity })
    },

    sellAllTackleByType({ dispatch, rootGetters }: any, type: string) {
      return new Promise((resolve) => {
        const inventory = rootGetters['fishing/inventory']
        const tackleToSell = inventory.filter((item: InventoryItem) =>
          item.type === 'tackle' && item.id.includes(type) && item.id !== 'rod_basic'
        )

        if (tackleToSell.length === 0) {
          resolve({ success: false, message: `Нет снастей типа ${type} для продажи` })
          return
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
        const availableItems = rootGetters['shop/availableItems']
        const baitItems = rootGetters['shop/baitItems']
        const netItems = rootGetters['shop/netItems']
        const allItems = [...availableItems, ...baitItems, ...netItems]

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
              const itemType = purchasedItem.type === 'bait' ? 'bait' :
                             purchasedItem.type === 'net' ? 'net' : type
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
      })
    }
  }
}