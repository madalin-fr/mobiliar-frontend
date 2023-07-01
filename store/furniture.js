export const state = () => ({
  bookmarkedFurnitureItems: {},
});

export const mutations = {
  ADD_BOOKMARKED_FURNITURE(state, { userEmail, furnitureId }) {
    // If the user has no bookmarked furniture items yet, create an empty object
    if (!state.bookmarkedFurnitureItems[userEmail]) {
      state.bookmarkedFurnitureItems = {
        ...state.bookmarkedFurnitureItems,
        [userEmail]: {},
      };
    }
    // toggle bookmark state for the furniture item
    if (state.bookmarkedFurnitureItems[userEmail][furnitureId]) {
      this._vm.$delete(state.bookmarkedFurnitureItems[userEmail], furnitureId);
    } else {
      this._vm.$set(state.bookmarkedFurnitureItems[userEmail], furnitureId, true);
    }
    // Persist bookmarked furniture items in cookies
    if (this.$cookies) {
      const cookieName = `mobiliar.bookmarkedFurnitureItems.${userEmail}`;
      this.$cookies.set(cookieName, state.bookmarkedFurnitureItems[userEmail], {
        sameSite: 'none',
        secure: true,
      });
    }
  },
  INIT_BOOKMARKED_FURNITURE(state, { userEmail, bookmarkedFurnitureItems }) {
    this._vm.$set(state.bookmarkedFurnitureItems, userEmail, bookmarkedFurnitureItems);
  },
};
export const actions = {
  bookmarkFurnitureItem({ commit, rootState }, furnitureId) {
    const userEmail = rootState.auth.user.email;
    commit("ADD_BOOKMARKED_FURNITURE", { userEmail, furnitureId });
  },
  async initBookmarkedFurnitureItems({ commit, rootState }) {
    if (this.$cookies && rootState.auth.user) {
      const userEmail = rootState.auth.user.email;
      const cookieName = `mobiliar.bookmarkedFurnitureItems.${userEmail}`;
      const bookmarkedFurnitureItems = this.$cookies.get(cookieName) || {};
      commit("INIT_BOOKMARKED_FURNITURE", { userEmail, bookmarkedFurnitureItems });
    }
  },
};


export const getters = {
  // pure function higher order function
  isFurnitureItemBookmarked: (state, getters, rootState) => (furnitureId) => {
    const userEmail = rootState.auth.user.email;
    return state.bookmarkedFurnitureItems[userEmail] && (furnitureId in state.bookmarkedFurnitureItems[userEmail]);
  },
};
