import {VISITOR_STATES} from "@/store/constants/visitorStates.js";
import {MUTATIONS} from "@/store/constants/mutation.js";

const ENTRANCE_CHANCE = 0.3

export const updateVisitor = (v, ctx) => {
    const { graph, entryMap, entrance, state, commit } = ctx

    if (handleBuildingState(v, state)) {
        return
    }
    if (handleLeavingState(v)) {
        return
    }

    tryEnterBuilding(v, entryMap, commit)
    moveVisitor(v, graph, entrance)
};

const handleBuildingState = (v) => {
    if (v.state !== VISITOR_STATES.IN_BUILDING) {
        return false
    }

    v.timeInBuilding--

    if (v.timeInBuilding > 0) {
        return true
    }

    const building = v.targetBuilding
    building.visitorsIn = building.visitorsIn.filter(id => id !== v.id)

    v.state = VISITOR_STATES.WALKING
    v.node = v.prevNode
    v.prevNode = null
    v.targetBuilding = null

    return true
};

const handleLeavingState = v => {
    if (v.state !== VISITOR_STATES.LEAVING) {
        return false
    }

    v.state = VISITOR_STATES.TO_REMOVE
    return true
};

const tryEnterBuilding = (v, entryMap, commit) => {
    const [x, y] = v.node.split(':').map(Number)

    const dirs = [
        [1, 0], [-1, 0], [0, 1], [0, -1]
    ]

    for (const [dx, dy] of dirs) {
        const key = `${x + dx}:${y + dy}`

        if (!entryMap.has(key)) {
            continue
        }
        if (Math.random() >= ENTRANCE_CHANCE) {
            continue
        }

        const building = entryMap.get(key)

        if (v.money < building.shape.visitCost) {
            return
        }

        if (v.lastBuildingId === building.id) {
            return
        }

        if (building.visitorsIn.length >= building.shape.capacity) {
            return
        }

        v.prevNode = v.node
        v.node = key
        v.lastBuildingId = building.id

        v.state = VISITOR_STATES.IN_BUILDING
        v.targetBuilding = building
        v.timeInBuilding = building.shape.visitTime

        v.money -= building.shape.visitCost
        commit(MUTATIONS.INCREASE_BALANCE, building.shape.visitCost)

        building.visitorsIn.push(v.id)
        break
    }
};

const moveVisitor = (v, graph, entrance) => {
    const neighbors = graph.get(v.node) || []
    if (!neighbors.length) {
        return
    }

    let options = neighbors

    if (v.prevNode) {
        options = neighbors.filter(n => n !== v.prevNode)
    }

    const next = options.length
        ? options[Math.floor(Math.random() * options.length)]
        : neighbors[0]

    v.prevNode = v.node
    v.node = next

    if (v.node === `${entrance.x}:${entrance.y}`) {
        v.state = VISITOR_STATES.LEAVING
    }
};
