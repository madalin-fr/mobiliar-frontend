  <template>
    <v-container fluid>
      <v-row class="d-flex align-content-stretch">
        <v-col cols="12" md="7" lg="8" xl="9" xxl="10" class="d-flex flex-column">

          <v-btn @click="startAR"
                 class="mb-6"
                 :disabled="loading"
                 style="align-self: start">
            <v-icon>{{ 'mdi-play' }}</v-icon>
            {{ 'Start AR' }}
          </v-btn>
          <v-card class="mb-4">
            <v-card-title>
              <h1 class="display-1">{{ furnitureItem.name }}</h1>
            </v-card-title>
            <v-card-text>
              <p class="subtitle-1 mb-4">{{ furnitureItem.description }}</p>
            </v-card-text>
          </v-card>
          <v-card class="mb-4">
            <v-card-title>Details</v-card-title>
            <v-card-text>
              <p>Price: ${{ furnitureItem.price }}</p>
              <p>Created at: {{ furnitureItem.createdAt }}</p>
            </v-card-text>
          </v-card>
          <v-card>
            <v-card-title>Seller Information</v-card-title>
            <v-card-text>
              <p>Seller: {{ furnitureItem.customerName }}</p>
              <p>Email: {{ furnitureItem.customerEmail }}</p>
              <p>Phone: {{ furnitureItem.customerPhoneNumber }}</p>
              <p>Address: {{ furnitureItem.customerAddress1 }}, {{ furnitureItem.customerAddress2 }}</p>
              <v-btn v-if="isOwner()" @click="deleteFurnitureItem" color="red" dark>Delete Furniture</v-btn>
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
  </template>

  <script>
  import FurnitureARScene from "@/components/FurnitureARScene.vue";
  import Furniture3DScene from "@/components/Furniture3DScene.vue";

  export default {
    components: {
      FurnitureARScene,
      Furniture3DScene,
    },
    mounted() {
      console.log(this.furnitureItem);
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
    methods: {
      startAR() {
        this.$emit("start-ar");
      },
      isOwner() {
        return this.furnitureItem.customerEmail === this.$auth.user.email;
      },
      deleteFurnitureItem() {
        const url = `/api/furniture/${this.furnitureItem.id}`;
        axios.delete(url)
          .then(response => {
            console.log('Furniture item deleted successfully:', response.data);
            })
          .catch(error => {
            console.error('Error deleting furniture item:', error.response.data);
            });
      },
    },
  };
  </script>
