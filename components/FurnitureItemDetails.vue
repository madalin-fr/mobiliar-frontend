<template>
  <div>
  <v-container fluid>
    <v-row class="d-flex align-content-stretch">
      <v-col cols="12" md="7" lg="8" xl="9" xxl="10" class="d-flex flex-column">
        <v-card class="mb-4">
          <v-container fluid>
            <v-row>
              <v-col cols="12" sm="6" class="d-flex">
                <v-btn @click="startAR"
                       :disabled="loading"
                       class="mb-2 ">
                  <v-icon left>{{ 'mdi-play' }}</v-icon>
                  {{ 'Start AR' }}
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" class="d-flex justify-end-on-sm">
                <v-btn @click="bookmarkFurniture" :color="isBookmarked ? 'grey' : 'primary'" :disabled="loading" class="mb-2 ">
                  <v-icon left>{{ isBookmarked ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}</v-icon>
                  {{ isBookmarked ? 'Remove Bookmark' : 'Add Bookmark' }}
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" v-if="isOwner" class="d-flex">
                <v-btn @click="deleteFurnitureItem" color="red" :disabled="loading" class="mb-2 ">
                  <v-icon left>{{ 'mdi-delete' }}</v-icon>
                  {{ 'Delete Furniture'}}
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" v-if="isOwner" class="d-flex justify-end-on-sm">
                <v-btn @click="openEditDialog" color="blue" :disabled="loading" class="">
                  <v-icon left>{{ 'mdi-pencil' }}</v-icon>
                  {{ 'Edit Details'}}
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
        <v-card class="mb-4">
          <v-card-title>
            <h1 class="display-1">{{ this.furnitureItem.name }}</h1>
          </v-card-title>
          <v-card-text>
            <p class="subtitle-1 mb-4">{{ this.furnitureItem.description }}</p>
          </v-card-text>
        </v-card>
        <v-card class="mb-4">
          <v-card-title>Details</v-card-title>
          <v-card-text>
            <p>Price: ${{ this.furnitureItem.price }}</p>
            <p>Created at: {{ this.furnitureItem.createdAt }}</p>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-title>Seller Information</v-card-title>
          <v-card-text>
            <p>Seller: {{ localFurnitureItem.customerName }}</p>
            <p>Email: {{ localFurnitureItem.customerEmail }}</p>
            <p>Phone: {{ localFurnitureItem.customerPhoneNumber }}</p>
            <p>Address: {{ localFurnitureItem.customerAddress1 }}, {{ localFurnitureItem.customerAddress2 }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="5" lg="4" xl="3" xxl="2"  class="d-flex flex-column">
        <div>
          <v-responsive :aspect-ratio="9 / 16">
            <v-card class="fill-height d-flex align-center justify-center" outlined>
              <Furniture3DScene :texture-blob-urls="textureBlobUrls" :mtl-url="String(mtlUrl)" :model-url="String(modelUrl)" :furniture-item="furnitureItem" v-if="!loading" />
              <v-progress-circular indeterminate color="primary" v-if="loading"></v-progress-circular>
            </v-card>
          </v-responsive>
        </div>
      </v-col>
    </v-row>
  </v-container>
    <!-- Edit Dialog -->
  <v-dialog v-model="editDialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">Edit Furniture</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                label="Name"
                v-model="editedFurnitureItem.name"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                label="Description"
                v-model="editedFurnitureItem.description"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Price"
                v-model="editedFurnitureItem.price"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="editDialog = false">Close</v-btn>
        <v-btn color="blue darken-1" text @click="saveChanges">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
    <!-- Delete Dialog -->
  <v-dialog v-model="confirmDeleteDialog" max-width="400px">
    <v-card>
      <v-card-title>Delete Confirmation</v-card-title>
      <v-card-text>Are you sure you want to delete this furniture item?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="confirmDeleteDialog = false">Cancel</v-btn>
        <v-btn color="green" text @click="confirmDeletion">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </div>
</template>

<script>
import FurnitureARScene from "@/components/FurnitureARScene.vue";
import Furniture3DScene from "@/components/Furniture3DScene.vue";

export default {
  components: {
    FurnitureARScene,
    Furniture3DScene,
  },
  data() {
    return {
      editDialog: false,
      editedFurnitureItem: {},
      confirmDeleteDialog: false,
      localFurnitureItem: { ...this.furnitureItem },
    }
  },

  props: {
    textureBlobUrls: {
      type: Object,
      required: true,
    },
    mtlUrl: {
      type: String,
      default: "",
    },
    modelUrl: {
      type: String,
      required: true,
    },
    furnitureItem: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    furnitureItem: {
      deep: true,
      immediate: true,
      handler(newValue) {
        this.localFurnitureItem = { ...newValue };
      },
    },
  },
  computed: {
    isOwner() {
      return this.localFurnitureItem.customerEmail === this.$auth.user.email;
    },
    isBookmarked() {
      return this.$store.getters["furniture/isFurnitureItemBookmarked"](this.furnitureItem.id);
    },
  },
  methods: {
    startAR() {
      this.$emit("start-ar");
    },
    bookmarkFurniture() {
      this.$store.dispatch("furniture/bookmarkFurnitureItem", this.furnitureItem.id);
    },
    deleteFurnitureItem() {
      this.confirmDeleteDialog = true;
    },
    async confirmDeletion() {
      const url = `/api/furniture/${this.localFurnitureItem.id}`;
      const config = {
        params: {
          customerEmail: this.$auth.user.email
        }
      };
      try {
        const response = await this.$axios.delete(url, config);
        console.log('Furniture item deleted successfully:', response.data);
        // Index of the current slide
        const currentIndex = this.$store.getters['swiper/getCurrentSlide'];
        const newIndex = Math.max(0, currentIndex - 1);
        this.$store.commit('swiper/setCurrentSlide', newIndex);

        // Close the confirmation dialog
        this.confirmDeleteDialog = false;

        // Redirect to the homepage
        this.$router.push('/');
      } catch (error) {
        console.error('Error deleting furniture item:', error.response.data);
      }
    },
    openEditDialog() {
      this.editedFurnitureItem = { ...this.furnitureItem };
      // Make sure all properties are set
      this.editedFurnitureItem.name = this.editedFurnitureItem.name || '';
      this.editedFurnitureItem.description = this.editedFurnitureItem.description || '';
      this.editedFurnitureItem.price = this.editedFurnitureItem.price || 50;
      this.editDialog = true;
    },
    async updateFurnitureItem() {
      const url = `/api/furniture/${this.furnitureItem.id}`;
      const updateDTO = {
        name: this.editedFurnitureItem.name,
        description: this.editedFurnitureItem.description,
        price: this.editedFurnitureItem.price
      };

      try {
        const response = await this.$axios.put(url, updateDTO, {
          params: {
            customerEmail: this.$auth.user.email
          }
        });

        console.log('Furniture item updated successfully:', response.data);
        this.localFurnitureItem = { ...this.editedFurnitureItem };
        this.$emit('update-furniture', this.localFurnitureItem);
      } catch (error) {
        console.error('Error updating furniture item:', error.response.data);
      }
    },
    async saveChanges() {
      await this.updateFurnitureItem();
      // Close the dialog
      this.editDialog = false;
    },
  },
};
</script>
<style scoped>
@media (min-width: 601px) {
  .justify-end-on-sm {
    justify-content: flex-end;
  }
}
</style>
