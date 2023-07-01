export const state = () => ({
  // cookie-universal module injects the $cookies object into the store
  darkMode: true,
});

export const mutations = {
  setDarkMode(state, value) {
    state.darkMode = value;
    if (this.$cookies) {
      this.$cookies.set('mobiliar.darkmode', value.toString(), {
        sameSite: 'none',
        secure: true,
      });
    }
  },
  toggleDarkMode(state) {
    state.darkMode = !state.darkMode;
    if (this.$cookies) {
      this.$cookies.set('mobiliar.darkmode', state.darkMode.toString(), {
        sameSite: 'none',
        secure: true,
      });
    }
  },
};

export const getters = {
  getDarkMode(state) {
    return state.darkMode;
  },
};
