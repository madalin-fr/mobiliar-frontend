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
            <v-btn>
              <v-icon>{{'mdi-play'}}</v-icon>
              {{'Start AR'}}
            </v-btn>
          </v-row>
        </v-container>
        <v-responsive :aspect-ratio="9 / 16">
          <v-card
            class="d-flex align-center justify-center"
            outlined
            :style="{height:'80vh'}"
          >
            <Furniture3DScene :texture-blob-urls="textureBlobUrls" :furniture-item="furnitureItem" />
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
      textureBlobUrls: {},
    };
  },
  async mounted() {
    this.textureBlobUrls = await this.loadTextures(this.furnitureItem);
  },
  methods: {
    async getFurnitureFileUrl(id, fileName) {

      const resourceUrl = `/api/furniture/${id}/${fileName}`;

      // Open the cache
      const cache = await caches.open('furniture-cache').catch((error) => {
        console.error('Error opening the cache:', error);
      });

      if (cache) {
        // Check if the resource is in the cache
        const cacheMatch = await cache.match(resourceUrl).catch((error) => {
          console.error('Error matching the cache:', error);
        });

        // If the resource is in the cache, return it
        if (cacheMatch) {
          const cachedBlob = await cacheMatch.blob();
          // Create a blob URL for the cached resource
          return URL.createObjectURL(cachedBlob);
        }
      }

      // If the resource is not in the cache, fetch it
      try {
        const response = await this.$axios.get(resourceUrl, { responseType: 'blob' });
        // Create a blob URL for the fetched resource
        const blobUrl = URL.createObjectURL(response.data);

        // Add the fetched resource to the cache if available
        if (cache) {
          // Create a new Response object with the same data as the original response
          const cacheableResponse = new Response(response.data, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });

          // Add the Response object to the cache
          // The resourceUrl is used as the cache key
          await cache.put(resourceUrl, cacheableResponse).catch((error) => {
            console.error('Error adding the resource to the cache:', error);
          });
        }

        return blobUrl;
      } catch (error) {
        console.error('Error fetching furniture file:', error);
        return '';
      }
    },
    async loadTextures(furnitureItem) {
      const { textureNames, id: furnitureItemId } = furnitureItem;
      const textureBlobUrls = {};
      for (const textureName of textureNames) {
        // Get the blob URL for the texture
        const blobUrl = await this.getFurnitureFileUrl(furnitureItemId, textureName);
        const blobUrlObj = new URL(blobUrl);
        const pathname = blobUrlObj.pathname;
        // Extract the blobName from the URL
        textureBlobUrls[textureName] = pathname.substring(pathname.lastIndexOf('/') + 1);
      }
      return textureBlobUrls;
    },
  },
};
</script>

