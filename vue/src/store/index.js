import { createStore } from "vuex";
import cardsModule from "./cards";

export default createStore({
  modules: {
    cards: cardsModule,
  },
});
