<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center">
        <h1 class="display-1">Discover Your Perfect Furniture</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="3"
        v-for="item in items"
        :key="item.id"
      >
        <v-card>
          <v-img :src="item.image" aspect-ratio="1.7"></v-img>
          <v-card-title>{{ item.title }}</v-card-title>
          <v-card-text>{{ item.description }}</v-card-text>
          <v-card-actions>
            <v-btn color="primary" text>Details</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="secondary" text>Buy</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      items: [
        // Your furniture items data here
      ],
    };
  },
};
</script>
