export const state = () => ({
  currentSlide: 0
});

export const mutations = {
  setCurrentSlide(state, slideIndex) {
    state.currentSlide = slideIndex;
  }
};

export const getters = {
  getCurrentSlide(state) {
    return state.currentSlide;
  }
};
