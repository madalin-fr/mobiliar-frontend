<template>
  <v-container fluid>
    <v-row>
      <v-col cols="8" >
        <FurnitureInfo :furnitureItem="furnitureItem"/>
      </v-col>
      <v-col cols="4">
        <v-container>
          <v-row>
              <FurnitureViewToggle @toggle-view="toggleAR"/>
            <!-- Add any other content here -->
          </v-row>
        </v-container>
        <v-card class="fill-height" v-if="showAR">
          <FurnitureAR :furnitureItem="furnitureItem"/>
        </v-card>
        <v-card class="fill-height d-flex align-center justify-center" v-else>
          <FurnitureCustomEnvironment :furnitureItem="furnitureItem"/>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<style>



</style>

<script>
import FurnitureInfo from '@/components/FurnitureInfo.vue';
import FurnitureViewToggle from '@/components/FurnitureViewToggle.vue';
import FurnitureAR from '@/components/FurnitureAR.vue';
import FurnitureCustomEnvironment from '@/components/FurnitureCustomEnvironment.vue';

export default {
  components: {
    FurnitureInfo,
    FurnitureViewToggle,
    FurnitureAR,
    FurnitureCustomEnvironment,
  },
  props: {
    furnitureItem: Object,
  },
  data() {
    return {
      showAR: false,
    };
  },
  methods: {
    toggleAR() {
      this.showAR = !this.showAR;
    },
  },
};
</script>
