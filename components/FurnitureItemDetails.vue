<template>
  <v-container fluid>
    <v-row>
      <v-col cols="9">
        <div>
          <h1>{{ furnitureItem.name }}</h1>
          <p>{{ furnitureItem.description }}</p>
          <p>Price: ${{ furnitureItem.price }}</p>
        </div>
      </v-col>
      <v-col cols="3">
        <v-container>
          <v-row>
            <v-btn @click="toggleScene">
              <v-icon>{{ showAR ? 'mdi-pause' : 'mdi-play' }}</v-icon>
              {{ showAR ? 'Pause AR' : 'Start AR' }}
            </v-btn>
          </v-row>
        </v-container>
        <v-responsive :aspect-ratio="9 / 16">
          <v-card
            class="d-flex align-center justify-center"
            outlined
          >
            <component :is="currentSceneComponent" :furnitureItem="furnitureItem" :showAR="showAR" />
          </v-card>
        </v-responsive>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FurnitureARScene from "@/components/FurnitureARScene.vue";
import Furniture3DScene from "@/components/Furniture3DScene.vue";

export default {
  components: {
    FurnitureARScene,
    Furniture3DScene,
  },
  props: {
    furnitureItem: Object,
  },
  data() {
    return {
      showAR: false,
    };
  },
  computed: {
    currentSceneComponent() {
      return this.showAR ? "FurnitureARScene" : "Furniture3DScene";
    },
  },
  methods: {
    toggleScene() {
      this.showAR = !this.showAR;
    },
  },
};
</script>

<style scoped>
.v-card {
  height: 80vh;
}
</style>
