export const state = () => ({
  bookmarkedFurnitureItems: {},
});

export const mutations = {
  SET_BOOKMARKED_FURNITURE(state, { userEmail, furnitureItems }) {
    state.bookmarkedFurnitureItems[userEmail] = furnitureItems;
  },
  TOGGLE_BOOKMARKED_FURNITURE(state, { userEmail, furnitureId }) {
    const items = state.bookmarkedFurnitureItems[userEmail] || {};

    if (items[furnitureId]) {
      this._vm.$delete(items, furnitureId);
    } else {
      this._vm.$set(items, furnitureId, true);
    }

    state.bookmarkedFurnitureItems[userEmail] = items;
  },
};

export const actions = {
  async nuxtServerInit({ commit }, { req }) {
    // Initialize cookies using the server request
    this.$cookies.init(req);
  },
  bookmarkFurnitureItem({ commit, state, rootState }, furnitureId) {
    const userEmail = rootState.auth.user.email;
    commit("TOGGLE_BOOKMARKED_FURNITURE", { userEmail, furnitureId });

    const cookieName = `mobiliar.bookmarkedFurnitureItems.${userEmail}`;
    this.$cookies.set(cookieName, state.bookmarkedFurnitureItems[userEmail], {
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
  },
  async initBookmarkedFurnitureItems({ commit, rootState }) {
    if (rootState.auth.user) {
      const userEmail = rootState.auth.user.email;
      const cookieName = `mobiliar.bookmarkedFurnitureItems.${userEmail}`;
      const bookmarkedFurnitureItems = this.$cookies.get(cookieName) || {};
      commit("SET_BOOKMARKED_FURNITURE", { userEmail, furnitureItems: bookmarkedFurnitureItems });
    }
  },
};

export const getters = {
  isFurnitureItemBookmarked: (state, getters, rootState) => (furnitureId) => {
    const userEmail = rootState.auth.user.email;
    const items = state.bookmarkedFurnitureItems[userEmail];
    return items && items[furnitureId];
  },
};
