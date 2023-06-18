<template>
  <v-container fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" sm="8">
        <v-card>
          <v-card-title>
            Add New Furniture Product
            <v-spacer></v-spacer>
          </v-card-title>
          <v-card-text>
            <CreateFurnitureForm />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import CreateFurnitureForm from "@/components/CreateFurnitureForm.vue";
export default {
  components: {
    CreateFurnitureForm: CreateFurnitureForm,
  },
};
</script>
