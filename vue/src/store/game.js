import {centers} from '../data/centers'

const maxSpeed = 5

const MUTATIONS = {
    SET_SCORE: 'SET_SCORE',
    SET_SPEED: 'SET_SPEED',
    SET_WORLD_SPEED: 'SET_WORLD_SPEED',
    SET_PLAYER_X: 'SET_PLAYER_X',
    SET_PLAYER_LIVES: 'SET_PLAYER_LIVES',
    SET_STUNNED: 'SET_STUNNED',
    SET_IS_OVER: 'SET_IS_OVER',
    SET_RECORD: 'SET_RECORD',
    ADD_OBSTACLE: 'ADD_OBSTACLE',
    REMOVE_OBSTACLE: 'REMOVE_OBSTACLE',
    SET_OBSTACLE_Y: 'SET_OBSTACLE_Y',
    ADD_BONUS: 'ADD_BONUS',
    REMOVE_BONUS: 'REMOVE_BONUS',
    SET_BONUS_Y: 'SET_BONUS_Y',
    INCREASE_CAR_ID: 'INCREASE_CAR_ID',
    SET_OBSTACLE_HIT: 'SET_OBSTACLE_HIT',
    REMOVE_OFFSCREEN: 'REMOVE_OFFSCREEN',
}

export default {
    namespaced: true,
    state () {
        return {
            score: 0,
            record: parseInt(localStorage.getItem('gameRecord') || '0'),
            speed: 1,
            worldSpeed: 2.25,
            carId: 0,
            player: {
                x: 55,
                lives: 3,
            },
            obstacles: [],
            bonuses: [],
            isStunned: false,
            isOver: false,
        }
    },
    getters: {
        getScore: (state) => state.score,
        getRecord: (state) => state.record,
        getSpeed: (state) => state.speed,
        getWorldSpeed: (state) => state.worldSpeed,
        getPlayer: (state) => state.player,
        getObstacles: (state) => state.obstacles,
        getBonuses: (state) => state.bonuses,
        getIsStunned: (state) => state.isStunned,
        getIsOver: (state) => state.isOver,
    },
    mutations: {
        [MUTATIONS.SET_SCORE]: (state, payload) => {
            state.score = payload
        },
        [MUTATIONS.SET_SPEED]: (state, payload) => {
            state.speed = payload
        },
        [MUTATIONS.SET_WORLD_SPEED]: (state, payload) => {
            state.worldSpeed = payload
        },
        [MUTATIONS.SET_PLAYER_X]: (state, payload) => {
            state.player.x = payload
        },
        [MUTATIONS.SET_PLAYER_LIVES]: (state, payload) => {
            state.player.lives = payload
        },
        [MUTATIONS.SET_STUNNED]: (state, stunned) => {
            state.isStunned = stunned
        },
        [MUTATIONS.SET_IS_OVER]: (state, isOver) => {
            state.isOver = isOver
        },
        [MUTATIONS.SET_RECORD]: (state, payload) => {
            state.record = payload
        },
        [MUTATIONS.ADD_OBSTACLE]: (state, obstacle) => {
            state.obstacles.push(obstacle)
        },
        [MUTATIONS.REMOVE_OBSTACLE]: (state, id) => {
            const index = state.obstacles.findIndex(obstacle => obstacle.id === id)
            if (index !== -1)
                state.obstacles.splice(index, 1)
        },
        [MUTATIONS.SET_OBSTACLE_Y]: (state, {id, newY}) => {
            const obstacle = state.obstacles.find(obstacle => obstacle.id === id)
            if (obstacle)
                obstacle.y = newY
        },
        [MUTATIONS.ADD_BONUS]: (state, bonus) => {
            state.bonuses.push(bonus)
        },
        [MUTATIONS.REMOVE_BONUS]: (state, id) => {
            const index = state.bonuses.findIndex(bonus => bonus.id === id)
            if (index !== -1)
                state.bonuses.splice(index, 1)
        },
        [MUTATIONS.SET_BONUS_Y]: (state, {id, newY}) => {
            const bonus = state.bonuses.find(bonus => bonus.id === id)
            if (bonus)
                bonus.y = newY
        },
        [MUTATIONS.INCREASE_CAR_ID]: (state) => {
            state.carId++
        },
        [MUTATIONS.SET_OBSTACLE_HIT]: (state, id) => {
            const obstacle = state.obstacles.find(obstacle => obstacle.id === id)
            if (obstacle)
                obstacle.hit = true
        },
        [MUTATIONS.REMOVE_OFFSCREEN]: (state) => {
            state.obstacles = state.obstacles.filter(obstacle => obstacle.y < 120)
            state.bonuses = state.bonuses.filter(bonus => bonus.y < 120)
        }
    },
    actions: {
        updatePlayerX({state, commit}, payload) {
            commit(MUTATIONS.SET_PLAYER_X, payload)
        },
        newObstacle({state, commit}) {
            const rand = Math.random()
            let type = 'car'
            if (rand < 0.2)
                type = 'hole'
            else if (rand < 0.4)
                type = 'barrier'
            const x = centers[Math.floor(Math.random() * centers.length)]
            const id = state.carId
            commit(MUTATIONS.INCREASE_CAR_ID)
            commit(MUTATIONS.ADD_OBSTACLE, {
                id: id,
                type: type,
                x: x,
                direction: 1,
                y: -50,
                hit: false,
            })
        },
        newBonus({state, commit}) {
            const type = Math.random() < 0.5 ? 'heart' : 'boost'
            const x = centers[Math.floor(Math.random() * centers.length)]
            const id = state.carId
            commit(MUTATIONS.INCREASE_CAR_ID)
            commit(MUTATIONS.ADD_BONUS, {
                id: id,
                type: type,
                x: x,
                y: -50
            })
        },
        applyBoost({state, commit}) {
            const originalSpeed = state.speed
            const newSpeed = Math.min(state.speed * 2, maxSpeed * 1.2)
            commit(MUTATIONS.SET_SPEED, newSpeed)
            setTimeout(() => {
                if (state.speed > originalSpeed) {
                    commit(MUTATIONS.SET_SPEED, originalSpeed)
                }
            }, 6000)
        },
        handleBonus({state, commit, dispatch}, {bonusId, bonusType}) {
            if (bonusType === 'heart') {
                commit(MUTATIONS.SET_PLAYER_LIVES, Math.min(state.player.lives + 1, 4))
            }
            else if (bonusType === 'boost') {
                dispatch('applyBoost')
            }
            commit(MUTATIONS.REMOVE_BONUS, bonusId)
        },
        gameOver({state, commit}) {
            commit(MUTATIONS.SET_IS_OVER, true)
            if (Math.floor(state.score) > state.record) {
                commit(MUTATIONS.SET_RECORD, Math.floor(state.score))
                localStorage.setItem('gameRecord', String(state.record))
            }
        },
        handleAccident({state, commit}, obstacleId) {
            const obstacle = state.obstacles.find(obstacle => obstacle.id === obstacleId)
            if (!obstacle || obstacle.hit) return

            commit(MUTATIONS.SET_PLAYER_LIVES, state.player.lives - 1)
            commit(MUTATIONS.SET_OBSTACLE_HIT, obstacleId)

            if (!state.isStunned) {
                commit(MUTATIONS.SET_STUNNED, true)
                commit(MUTATIONS.SET_SPEED, 0.01)
                setTimeout(() => {
                    commit(MUTATIONS.SET_STUNNED, false)
                    if (state.speed < 0.2)
                        commit(MUTATIONS.SET_SPEED, 0.2)
                }, 500)
            }
            setTimeout(() => {
                commit(MUTATIONS.REMOVE_OBSTACLE, obstacleId)
            }, 200)
            if (state.player.lives <= 0)
                dispatch('gameOver')
        },
        updateGame({state, commit}) {
            commit(MUTATIONS.SET_SCORE, state.score + 0.05 * state.speed)
            if (state.speed < maxSpeed) {
                commit(MUTATIONS.SET_SPEED, state.speed += 0.003)
            }
            else {
                commit(MUTATIONS.SET_SPEED, state.speed += 0.00001)
            }

            if (state.worldSpeed < maxSpeed) {
                commit(MUTATIONS.SET_WORLD_SPEED, state.worldSpeed += 0.0001)
            }
            state.obstacles.forEach(obstacle => commit(MUTATIONS.SET_OBSTACLE_Y, {
                id: obstacle.id,
                newY: obstacle.y + state.worldSpeed
            }))
            state.bonuses.forEach(bonus => commit(MUTATIONS.SET_BONUS_Y, {
                id: bonus.id,
                newY: bonus.y + state.worldSpeed
            }))
        },
        removeObjects({state, commit}) {
            commit(MUTATIONS.REMOVE_OFFSCREEN)
        },
    }
}