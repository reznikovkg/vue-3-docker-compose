const MUTATIONS = {
  SHOW_RESULT_PANEL: 'SHOW_RESULT_PANEL',
  HIDE_RESULT_PANEL: 'HIDE_RESULT_PANEL',
  PUSH_NOTIFICATION: 'PUSH_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
};

const buildInitialState = () => ({
  resultPanel: {
    isOpen: false,
    isSuccess: null,
    message: '',
  },
  notifications: [],
});

let notificationCounter = 0;

export default {
  namespaced: true,
  state() {
    return buildInitialState();
  },
  getters: {
    getResultPanel: (state) => state.resultPanel,
    getNotifications: (state) => state.notifications,
  },
  mutations: {
    [MUTATIONS.SHOW_RESULT_PANEL]: (state, payload) => {
      state.resultPanel = {
        isOpen: true,
        isSuccess: payload.isSuccess,
        message: payload.message,
      };
    },
    [MUTATIONS.HIDE_RESULT_PANEL]: (state) => {
      state.resultPanel = {
        isOpen: false,
        isSuccess: null,
        message: '',
      };
    },
    [MUTATIONS.PUSH_NOTIFICATION]: (state, payload) => {
      state.notifications.push({
        id: payload.id,
        type: payload.type || 'info',
        message: payload.message,
      });
    },
    [MUTATIONS.REMOVE_NOTIFICATION]: (state, id) => {
      state.notifications = state.notifications.filter(
        (item) => item.id !== id,
      );
    },
    [MUTATIONS.CLEAR_NOTIFICATIONS]: (state) => {
      state.notifications = [];
    },
  },
  actions: {
    showResultPanel({ commit }, payload) {
      commit(MUTATIONS.SHOW_RESULT_PANEL, payload);
    },
    hideResultPanel({ commit }) {
      commit(MUTATIONS.HIDE_RESULT_PANEL);
    },
    pushNotification({ commit }, payload) {
      notificationCounter += 1;
      commit(MUTATIONS.PUSH_NOTIFICATION, {
        ...payload,
        id: `notification-${notificationCounter}`,
      });
    },
    removeNotification({ commit }, id) {
      commit(MUTATIONS.REMOVE_NOTIFICATION, id);
    },
    clearNotifications({ commit }) {
      commit(MUTATIONS.CLEAR_NOTIFICATIONS);
    },
  },
};
