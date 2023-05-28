<template>
  <v-container>
    <h1>Furniture List</h1>
    <v-row>
      <v-col
        v-for="furniture in furnitureList"
        :key="furniture.id"
        cols="12"
        sm="6"
        md="4"
      >
        <nuxt-link :to="`/furniture/${furniture.id}`">
          <v-card>
            <v-card-title>{{ furniture.name }}</v-card-title>
            <v-card-text>{{ furniture.description }}</v-card-text>
          </v-card>
        </nuxt-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      furnitureList: [],
    };
  },
  async created() {
    try {
      const response = await this.$axios.get('/api/furniture');
      this.furnitureList = response.data;
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching furniture data:', error);
    }
  },
};
</script>
