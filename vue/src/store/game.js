export const MUTATIONS = {
    SET_CARDS: "SET_CARDS",
    SET_TIME: "SET_TIME",
    SET_IS_CHECKING: "SET_IS_CHECKING",
    FLIP_CARD: "FLIP_CARD",
    SET_TIMER_INTERVAL: "SET_TIMER_INTERVAL",
    CLEAR_TIMER_INTERVAL: "CLEAR_TIMER_INTERVAL",
    RESET_GAME: "RESET_GAME",
    MATCH_CARDS: "MATCH_CARDS",
    UNFLIP_CARDS: "UNFLIP_CARDS",
    SET_HIGH_SCORE: "SET_HIGH_SCORE",
}
export default {
    namespaced: true,
    state: () => ({
        cards: [],
        time: 0,
        status: 'playing',
        timerInterval: null,
        highScore: localStorage.getItem('highScore') || null,
        isChecking: false,
    }),
    getters: {
        getCards: (state) => state.cards,
        getTime: (state) => state.time,
        getStatus: (state) => state.status,
        getHighScore: (state) => state.highScore,
        getTimerInterval: (state) => state.timerInterval,
        getIsChecking: (state) => state.isChecking,
        isFinish: (state) => state.cards.length > 0 && state.cards.every(card => card.matched)
    },
    mutations: {
        [MUTATIONS.SET_CARDS]: (state, cards) => state.cards = cards,
        [MUTATIONS.SET_TIME]: (state, time) => state.time = time,
        [MUTATIONS.SET_IS_CHECKING]: (state, isChecking) => state.isChecking = isChecking,
        [MUTATIONS.SET_TIMER_INTERVAL]: (state, interval) => state.timerInterval = interval,
        [MUTATIONS.FLIP_CARD]: (state, cardId) => {
            const card = state.cards.find(c => c.id === cardId)
            if (card) {
                card.flipped = true
            }
        },
        [MUTATIONS.CLEAR_TIMER_INTERVAL]: (state) => {
            clearInterval(state.timerInterval)
            state.timerInterval = null
        },
        [MUTATIONS.RESET_GAME]: (state) => {
            state.cards = []
            state.time = 0
            state.status = 'playing'
            state.isChecking = false
        },
        [MUTATIONS.MATCH_CARDS]: (state, cardIds) => {
            cardIds.forEach(cardId => {
                const card = state.cards.find(c => c.id === cardId)
                if (card) {
                    card.matched = true
                }
            })
        },
        [MUTATIONS.UNFLIP_CARDS]: (state, cardIds) => {
            cardIds.forEach(cardId => {
                const card = state.cards.find(c => c.id === cardId)
                if (card) {
                    card.flipped = false
                }
            })
        },
        [MUTATIONS.SET_HIGH_SCORE]: (state, score) => {
            state.highScore = score
            localStorage.setItem('highScore', score)
        }
    },
    actions: {
        initGame(store, pairs = 6) {
            store.commit(MUTATIONS.RESET_GAME)
            const numbers = [...Array(pairs).keys()].map(i => i + 1)
            const cardValues = [...numbers, ...numbers]
            cardValues.sort(() => Math.random() - 0.5)

            const cards = cardValues.map((value, index) => ({
                id: index,
                value: value,
                flipped: false,
                matched: false,
            }))
            store.commit(MUTATIONS.SET_CARDS, cards)
        },
        flipCard(store, cardId) {
            if (store.getters.getIsChecking) {
                return
            }
            const card = store.getters.getCards.find(c => c.id === cardId)
            if (card && !card.flipped && !card.matched) {
                store.commit(MUTATIONS.FLIP_CARD, cardId)
            }
        },
        startTimer(store) {
            if (!store.getters.getTimerInterval) {
                const interval = setInterval(() => {
                    store.commit(MUTATIONS.SET_TIME, store.getters.getTime + 1)
                }, 1000)
                store.commit(MUTATIONS.SET_TIMER_INTERVAL, interval)
            }
        },
        stopTimer({commit}) {
            commit('CLEAR_TIMER_INTERVAL')
        },
        checkForMatch(store) {
            return new Promise(resolve => {
                const flippedCards = store.getters.getCards.filter(card => card.flipped && !card.matched)
                if (flippedCards.length === 2) {
                    store.commit(MUTATIONS.SET_IS_CHECKING, true)
                    if (flippedCards[0].value === flippedCards[1].value) {
                        setTimeout(() => {
                            store.commit(MUTATIONS.MATCH_CARDS, flippedCards.map(c => c.id))
                            store.commit(MUTATIONS.SET_IS_CHECKING, false)
                            if (store.getters.isFinish) {
                                store.dispatch('stopTimer').then(store.dispatch('updateHighScore'))
                            }
                            resolve()
                        }, 500)
                    } else {
                        setTimeout(() => {
                            store.commit(MUTATIONS.UNFLIP_CARDS, flippedCards.map(c => c.id))
                            store.commit(MUTATIONS.SET_IS_CHECKING, false)
                            resolve()
                        }, 1000)
                    }
                } else {
                    resolve()
                }
            })
        },
        updateHighScore(store) {
            if (store.getters.getHighScore === null || store.getters.getTime < store.getters.getHighScore) {
                store.commit(MUTATIONS.SET_HIGH_SCORE, store.getters.getTime)
            }
        }
    }
}
