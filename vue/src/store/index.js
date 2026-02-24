import { createStore } from "vuex";
import { createCards, isGameComplete } from "../utils/cardsInit";

const MUTATIONS = {
  SET_DIFFICULTY: "SET_DIFFICULTY",
  START_GAME: "START_GAME",
  FLIP_CARD: "FLIP_CARD",
  SET_CARDS_FACE_UP: "SET_CARDS_FACE_UP",
  SET_PAIR_FOUND: "SET_PAIR_FOUND",
  CLEAR_OPENED_CARDS: "CLEAR_OPENED_CARDS",
  SET_CAN_FLIP: "SET_CAN_FLIP",
  SET_GAME_STATUS: "SET_GAME_STATUS",
  RESET_GAME: "RESET_GAME",
};

export default createStore({
  state: {
    cards: [],
    difficulty: 10,
    gameStatus: "menu", //menu, playing, finished
    openedCards: [],
    canFlip: true,
  },

  getters: {
    allCards: (state) => state.cards,
    gameStatus: (state) => state.gameStatus,
    isGameFinished: (state) => state.gameStatus === "finished",
    currentDifficulty: (state) => state.difficulty,
  },

  mutations: {
    [MUTATIONS.SET_DIFFICULTY]: (state, payload) => {
      state.difficulty = payload;
    },

    [MUTATIONS.START_GAME]: (state) => {
      state.cards = createCards(state.difficulty);
      state.gameStatus = "playing";
      state.openedCards = [];
      state.canFlip = true;
    },

    [MUTATIONS.FLIP_CARD]: (state, payload) => {
      const card = state.cards.find((c) => c.id === payload);
      if (
        card &&
        !card.isFounded &&
        !card.isFaceUp &&
        state.canFlip &&
        state.openedCards.length < 2
      ) {
        card.isFaceUp = true;
        state.openedCards.push(card);

        if (state.openedCards.length === 2) {
          state.canFlip = false;
        }
      }
    },

    [MUTATIONS.SET_CARDS_FACE_UP]: (state, payload) => {
      state.cards = state.cards.map((card) => {
        if (payload.cardIds.includes(card.id)) {
          return { ...card, isFaceUp: payload.isFaceUp };
        }
        return card;
      });
    },

    [MUTATIONS.SET_PAIR_FOUND]: (state, payload) => {
      state.cards = state.cards.map((card) => {
        if (payload.includes(card.id)) {
          return { ...card, isFounded: true };
        }
        return card;
      });
    },

    [MUTATIONS.CLEAR_OPENED_CARDS]: (state) => {
      state.openedCards = [];
    },

    [MUTATIONS.SET_CAN_FLIP]: (state, payload) => {
      state.canFlip = payload;
    },

    [MUTATIONS.SET_GAME_STATUS]: (state, payload) => {
      state.gameStatus = payload;
    },

    [MUTATIONS.RESET_GAME]: (state) => {
      state.gameStatus = "menu";
      state.cards = [];
      state.openedCards = [];
      state.canFlip = true;
    },
  },

  actions: {
    startGame(store, payload) {
      store.commit(MUTATIONS.SET_DIFFICULTY, payload);
      store.commit(MUTATIONS.START_GAME);
    },

    flipCard(store, payload) {
      if (store.state.canFlip) {
        const card = store.state.cards.find((c) => c.id === payload);
        if (!card || card.isFounded || card.isFaceUp) return;

        store.commit(MUTATIONS.FLIP_CARD, payload);

        if (store.state.openedCards.length === 2) {
          store.dispatch("checkPair");
        }
      }
    },

    checkPair(store) {
      store.commit(MUTATIONS.SET_CAN_FLIP, false);

      const [card1, card2] = store.state.openedCards;

      if (card1.pairId === card2.pairId) {
        store.dispatch("handleFoundPair", [card1.id, card2.id]);
      } else {
        store.dispatch("handleMismatchedPair", [card1.id, card2.id]);
      }
    },

    handleFoundPair(store, payload) {
      setTimeout(() => {
        store.commit(MUTATIONS.SET_PAIR_FOUND, payload);

        store.commit(MUTATIONS.CLEAR_OPENED_CARDS);

        store.commit(MUTATIONS.SET_CAN_FLIP, true);

        if (isGameComplete(store.state.cards)) {
          store.commit(MUTATIONS.SET_GAME_STATUS, "finished");
        }
      }, 700);
    },

    handleMismatchedPair(store, payload) {
      setTimeout(() => {
        store.commit(MUTATIONS.SET_CARDS_FACE_UP, {
          cardIds: payload,
          isFaceUp: false,
        });

        store.commit(MUTATIONS.CLEAR_OPENED_CARDS);

        store.commit(MUTATIONS.SET_CAN_FLIP, true);
      }, 1000);
    },

    resetGame(store) {
      store.commit(MUTATIONS.RESET_GAME);
    },
  },
});
