<template>
  <v-container>
    <h1>Furniture List</h1>
    <client-only>
      <div>
      <swiper ref="swiper"
              :options="swiperOption"
              @slideChange="onSlideChange"
      >
        <swiper-slide v-for="(furniture) in furnitureList" :key="furniture.id">
          <nuxt-link :to="`/furniture/${furniture.id}`">
            <v-card ref="cardBackground"
                    :class="['card-background', $vuetify.theme.dark ? 'dark' : 'light']"
                    outlined
            >
              <v-card-title>{{ furniture.name }}</v-card-title>
              <v-card-text>{{ furniture.description }}</v-card-text>
            </v-card>
          </nuxt-link>
        </swiper-slide>
        <div class="swiper-button-next" slot="button-next"></div>
        <div class="swiper-pagination"  slot="pagination"></div>
        <div class="swiper-button-prev"  slot="button-prev"></div>
      </swiper>
      </div>
    </client-only>
  </v-container>
</template>
<script>
export default {
  data() {
    return {
      furnitureList: [],
      swiperOption: {
        grabCursor:true,
        effect:'coverflow',
        centeredSlides: true,
        slidesPerView: 2,
        spaceBetween: 200,
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        pagination: {
          el: '.swiper-pagination',
          renderBullet(index, className) {
            return `<span class="${className} swiper-pagination-bullet-custom">${index + 1}</span>`
          },
          clickable: true
        },

      }
    };
  },
  methods: {
    onSlideChange() {
      if (this.$refs.swiper) {
        this.$store.commit('swiper/setCurrentSlide', this.$refs.swiper.$swiper.activeIndex);
      }
    },
  },
  computed: {
    darkMode() {
      return this.$store.getters.getDarkMode;
    },

  },
  async created() {
    this.swiperOption.initialSlide = this.$store.getters['swiper/getCurrentSlide'];
    try {
      const response = await this.$axios.get('/api/furniture');
      this.furnitureList = response.data;
    } catch (error) {
      console.error('Error fetching furniture data:', error.response.data);
    }
  },
};
</script>

<style scoped>
.card-background {
  position: relative;
  height: 60vh;
  width: auto;
}

.card-background::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("/2.jpg");
  background-size: cover;
}

.card-background.light::before {
  filter: contrast(0.2) brightness(1.9) blur(4px);
  //filter:blur(10px);
}

.card-background.dark::before {
  filter: brightness(0.5) blur(4px);
}

.card-background * {
  position: relative;
}
</style>
