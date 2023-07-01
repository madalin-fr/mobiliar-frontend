<template>
  <div>
    <FurnitureItemDetails
      class="container"
      :furnitureItem="furnitureItem"
      :textureBlobUrls="textureBlobUrls"
      :mtlUrl="mtlUrl"
      :modelUrl="modelUrl"
      :loading=loading
      @start-ar="startAR"
      @update-furniture="handleFurnitureUpdate"
      v-if="!$store.getters['vr-ar/getIsARactive']"
    />
    <FurnitureARScene
      ref="arScene"
      :furnitureItem="furnitureItem"
      :modelUrl="modelUrl"
      :mtlUrl="mtlUrl"
      :loading=loading
      v-else
    />
  </div>
</template>
<script>
import FurnitureItemDetails from "~/components/FurnitureItemDetails.vue";
import FurnitureARScene from "@/components/FurnitureARScene.vue";
import {getFurnitureFileAsBlobUrl} from '~/assets/furniture-utils.js';

async function fetchFurnitureItem(params, $axios) {
  try {
    const url = `/api/furniture/${params.id}`;
    const response = await $axios.get(url);
    if (response && response.data) {
      return response.data;
    } else {
      console.error('Error fetching furniture data: No data received');
    }
  } catch (error) {
    console.error('Error fetching furniture data:', error.response ? error.response.data : error.message);
  }
}
export default {
  components: {
    FurnitureItemDetails,
    FurnitureARScene,
  },
  data() {
    return {
      furnitureItem: {},
      textureBlobUrls: {},
      mtlUrl: '',
      modelUrl: '',
      loading: true,
    };
  },

  async asyncData({ params, $axios }) {
    const furnitureItem = await fetchFurnitureItem(params, $axios);
    return { furnitureItem };
  },



  async mounted() {
      await this.loadFurnitureFiles();
  },
  methods: {
    async handleFurnitureUpdate(updatedFurnitureItem) {
      console.log("am i this");
      this.furnitureItem = updatedFurnitureItem;
      console.log(this.furnitureItem.price);
    },
    async loadFurnitureFiles() {
      // Load the furniture model and textures
      // The furniture model and textures are fetched from the server and cached
      // blob URLs are created for the fetched resources
      // The MTL file is modified to use the blob URLs instead of filenames for the textures
      this.textureBlobUrls = await this.loadTextures(this.furnitureItem);
      this.modelUrl = await getFurnitureFileAsBlobUrl(this.$axios, this.furnitureItem.id, this.furnitureItem.modelName);
      if(this.furnitureItem.materialName) {
        this.mtlUrl = await getFurnitureFileAsBlobUrl(this.$axios, this.furnitureItem.id, this.furnitureItem.materialName);
        // Modify the MTL file to use the blob URLs instead of filenames for the textures
        this.mtlUrl = await this.modifyMTL(this.mtlUrl, this.textureBlobUrls);
      }
      this.loading = false;
    },
    async loadTextures(furnitureItem) {
      const {textureNames, id: furnitureItemId} = furnitureItem;
      if (!Array.isArray(textureNames)) {
        console.error("Error: textureNames is not an array");
        return {};
      }
      const textureBlobUrls = {};
      for (const textureName of textureNames) {
        // Get the blob URL for the texture
        const blobUrl = await getFurnitureFileAsBlobUrl(this.$axios,furnitureItemId, textureName);
        const blobUrlObj = new URL(blobUrl);
        const pathname = blobUrlObj.pathname;
        // Extract the blobName from the URL
        textureBlobUrls[textureName] = pathname.substring(pathname.lastIndexOf('/') + 1);
      }
      return textureBlobUrls;
    },
    replaceTexturePaths(mtlContent, textureBlobUrls) {
      const lines = mtlContent.split('\n');
      const textureMapProperties = ['map_Kd', 'map_Ks', 'map_Ns', 'map_bump', 'refl'];
      const updatedLines = lines.map(line => {
        const words = line.split(' ');
        if (words.length > 1 && textureMapProperties.includes(words[0])) {
          const texturePath = words[1];
          if (textureBlobUrls[texturePath]) {
            return `${words[0]} ${textureBlobUrls[texturePath]}`;
          }
        }
        return line;
      });
      return updatedLines.join('\n');
    },
    async modifyMTL(mtlUrl, textureBlobUrls) {
      try {
        // Fetch the MTL content
        const response = await fetch(mtlUrl);
        // Read the contents of the blob as text
        const mtlContent = await response.text();
        // Replace texture file paths with Blob URLs
        const modifiedMtlContent = this.replaceTexturePaths(mtlContent, textureBlobUrls);
        // Create a new Blob with the modified MTL content
        const modifiedMtlBlob = new Blob([modifiedMtlContent], { type: 'text/plain' });
        // Create a blob URL for the modified MTL content
        return URL.createObjectURL(modifiedMtlBlob);
      } catch (error) {
        console.error('Error fetching and modifying MTL content:', error);
        return '';
      }
    },
    startAR() {
      this.$store.commit('vr-ar/startAR');
    },
  },
  computed: {
    isARActive() {
      return this.$store.getters['vr-ar/getIsARactive'];
    },
  },
  watch: {
    isARActive(isARActive) {
      if (isARActive) {
        this.$nuxt.setLayout('empty');
      } else {
        this.$nuxt.setLayout('default');
      }
    },
  },
};
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 80vh;
}
</style>
