export const state = () => ({
  isARactive: false,
});

export const mutations = {
  startAR(state) {
    state.isARactive = !state.isARactive;
  },
};

export const getters = {
  getIsARactive(state) {
    return state.isARactive;
  },
};
