export const actions = {
  async getUserInfo({ commit }) {
    try {
      const response = await this.$axios.$get(`"/api/auth/user"`);
      this.$auth.setUser(response.data);
    } catch (err) {
      console.error('Error getting user info:', err);
    }
  },
};
