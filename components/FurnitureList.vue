<template>
  <div class="furniture-list">
    <h1 class="text-center">Furniture List</h1>
    <v-spacer></v-spacer>
    <client-only>
      <swiper
        style="margin-top:10vh; margin-bottom:10vh;"
        class="swiper"
              :options="swiperOption"
              @slideChange="onSlideChange"

      >
        <swiper-slide v-for="(furniture) in furnitureList" :key="furniture.id" >
          <nuxt-link :to="`/furniture/${furniture.id}`">
            <v-card ref="cardBackground"
                    :class="['card-background', $vuetify.theme.dark ? 'dark' : 'light']"
                    outlined
            >
              <div class="background-image" :style="{ backgroundImage: `url('${backgroundImageURL(furniture)}')` }"></div>
              <div class="overlay"></div>
              <v-card-title>{{ furniture.name }}</v-card-title>
              <v-card-text class="mb-8">
                Posted by {{ furniture.customerName }} on {{ formatDate(furniture.createdAt) }}
              </v-card-text>
            </v-card>
          </nuxt-link>
        </swiper-slide>
        <div class="swiper-button-next" slot="button-next"></div>
        <div class="swiper-pagination"  slot="pagination"></div>
        <div class="swiper-button-prev"  slot="button-prev"></div>
      </swiper>
    </client-only>
  </div>
</template>
<script>
import {getFurnitureFileAsBlobUrl} from "assets/furniture-utils";

export default {
  data() {
    return {
      furnitureList: [],
      imageUrls: {},
      swiperOption: {
        grabCursor:true,
        autoHeight:true,
        effect:'coverflow',
        centeredSlides: true,
        slidesPerView: 2,
        lazy:true,
        spaceBetween: 10,
        coverflowEffect: {
          rotate: 40,
          stretch: 0,
          depth: 20,
          modifier: 1,
          slideShadows: true,
        },
        breakpoints: {
          1024: {
            slidesPerView: 4,
          },
          1600: {
            slidesPerView: 5,
          },
          1920: {
            slidesPerView: 6,
          },
          2560: {
            slidesPerView: 8,
          },
          4096: {
            slidesPerView: 10,
          },
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        pagination: {
          el: '.swiper-pagination',
          type: 'fraction'
        },

      }
    };
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    onSlideChange() {
      if (this.$refs.swiper) {
        this.$store.commit('swiper/setCurrentSlide', this.$refs.swiper.$swiper.activeIndex);
      }
    },
    async loadImageUrls() {
      for (const furniture of this.furnitureList) {
        const imageUrl = await getFurnitureFileAsBlobUrl(
          this.$axios,
          furniture.id,
          furniture.imageName
        );
        this.$set(this.imageUrls, furniture.id, imageUrl); // Use this.$set to ensure reactivity
      }
    },
    applyBackgroundImages() {
      for (const furniture of this.furnitureList) {
        const card = this.$refs.cardBackground.find(
          (card) => card._props.outlined
        );
        const imageUrl = this.backgroundImageURL(furniture);
        if (card) {
          card.$el.style.setProperty(
            '--dynamic-background-image',
            `url('${imageUrl}')`
          );
        }
      }
    },

  },
  computed: {
    backgroundImageURL() {
      return (furniture) => {
        return this.imageUrls[furniture.id] || '/3.png';
      };
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.applyBackgroundImages();
    });
  },
  async created() {
    this.swiperOption.initialSlide = this.$store.getters['swiper/getCurrentSlide'];
    try {
      const response = await this.$axios.get('/api/furniture');
      this.furnitureList = response.data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      console.log(this.furnitureList);
      await this.loadImageUrls();
    } catch (error) {
      console.error('Error fetching furniture data:', error.response.data);
    }
  },
};
</script>
<style scoped>



.card-background {
  position: relative;
  overflow:hidden;
  height:60vh;
  max-height:900px;
  display: flex;
  flex-direction: column;
  justify-content:space-between;

}


.background-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.card-background.light .background-image {
  filter: contrast(0.2) brightness(1.9) blur(4px);
}

.card-background.dark .background-image {
  filter: brightness(0.3) blur(22px);
}

.card-background .v-card__title,
.card-background .v-card__text {
  position: relative;
  z-index: 2;
}
</style>
