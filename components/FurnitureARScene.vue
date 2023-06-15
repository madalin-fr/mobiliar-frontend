<!--<template>-->
<!--  <client-only>-->
<!--    <div>-->
<!--      <a-scene class="my-scene" embedded arjs="trackingMethod: best; sourceType: webcam;">-->
<!--        <a-marker preset="hiro">-->
<!--          <a-box position="0 0.5 0" material="color: blue;"></a-box>-->
<!--        </a-marker>-->
<!--        <a-entity camera></a-entity>-->
<!--      </a-scene>-->
<!--    </div>-->
<!--  </client-only>-->
<!--</template>-->

<template>

</template>

<!--<style scoped>-->
<!--.my-scene {-->
<!--  width: 300px;-->
<!--  height: auto;-->
<!--}-->
<!--</style>-->

<!--<style scoped>-->
<!--.a-scene {-->
<!--  width: 400px;-->
<!--  height: 300px;-->
<!--  position: relative;-->
<!--}-->

<!--</style>-->

<!--<template>-->
<!--  <client-only>-->
<!--    <a-scene arjs="sourceType: webcam;">-->
<!--      <a-entity camera></a-entity>-->

<!--      <a-entity id="customEnvironment">-->
<!--        <a-entity v-if="model" class="textures-container">-->
<!--          <a-entity geometry="primitive: box;" @click="toggleTextureMenu"-->
<!--                    material="color: #333;">-->
<!--            <a-text value="Toggle Textures" align="center" position="0 1.5 0" scale="1.5 1.5 1.5"></a-text>-->
<!--          </a-entity>-->
<!--          <a-entity v-for="textureName in furnitureItem.textureNames"-->
<!--                    v-show="showTexturesMenuFlag && model"-->
<!--                    class="texture-item">-->
<!--            <a-entity geometry="primitive: box;" @click="toggleTexture(textureName)"-->
<!--                      material="color: #333;">-->
<!--              <a-text :value="textureName" align="center" position="0 1.5 0" scale="1.5 1.5 1.5"></a-text>-->
<!--            </a-entity>-->
<!--          </a-entity>-->
<!--        </a-entity>-->
<!--      </a-entity>-->
<!--    </a-scene>-->
<!--  </client-only>-->
<!--</template>-->

<script>
export default {
  props: {
    furnitureItem: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      THREE: null,
      scene: null,
      modelWrapper: null,
      model: null,
      activeTextures: {},
      showTexturesMenuFlag: false
    }
  },
  async mounted() {
    this.THREE = window.AFRAME.THREE;
    this.activeTextures = this.furnitureItem.textureNames.reduce((acc, name) => {
      acc[name] = true;
      return acc;
    }, {});
    await this.loadModel(this.THREE.OBJLoader,this.THREE.MTLLoader);
  },
  methods: {
    toggleTextureMenu() {
      this.showTexturesMenuFlag = !this.showTexturesMenuFlag;
    },
    async toggleTexture(textureName) {
      if (!this.modelWrapper) return;
      this.activeTextures[textureName] = !this.activeTextures[textureName];
      this.scene.remove(this.modelWrapper);
      this.modelWrapper.remove(this.model);
      await this.loadModel(this.THREE.OBJLoader,this.THREE.MTLLoader);
      this.scene.add(this.modelWrapper);
    },
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
          const cachedBlobUrl = URL.createObjectURL(cachedBlob);
          return cachedBlobUrl;
        }
      }

      try {
        const response = await this.$axios.get(resourceUrl, { responseType: 'blob' });
        const blobUrl = URL.createObjectURL(response.data);

        // Add the fetched resource to the cache if available
        if (cache) {
          // Create a new Response object with the same data as the original response
          const cacheableResponse = new Response(response.data, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });

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
    async loadModel(OBJLoader, MTLLoader) {
      return new Promise(async (resolve, reject) => {
        try {
          if (this.modelType === 'obj') {
            const objLoader = new OBJLoader();
            const modelUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.modelName);
            const mtlUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.materialName);
            const mtlLoader = new MTLLoader();
            mtlLoader.load(mtlUrl, async (materials) => {
              // Load textures
              const textureBlobUrls = await this.loadTextures(this.furnitureItem.textureNames, this.furnitureItem.id);

              // Replace texture file paths with Blob URLs in materials
              for (const materialName in materials.materialsInfo) {
                const materialInfo = materials.materialsInfo[materialName];
                const textureMapProperties = ['map_kd', 'map_ks', 'map_ns', 'map_bump', 'refl'];

                textureMapProperties.forEach((property) => {
                  if (materialInfo[property] && textureBlobUrls[materialInfo[property]]) {
                    if (this.activeTextures[materialInfo[property]]) {
                      materialInfo[property] = textureBlobUrls[materialInfo[property]];
                    } else {
                      materialInfo[property] = "";
                    }
                  }
                });
              }

              materials.preload();
              objLoader.setMaterials(materials);
              objLoader.load(modelUrl, async (obj) => {
                // Save the model reference
                this.model = obj;
                const {center, size} = this.centerModel(this.model);
                this.modelSize = size;
                this.modelWrapper.add(this.model);
                resolve();

              }, undefined, (error) => {
                console.error('Error loading OBJ model:', error);
                reject(error);
              });
            }, undefined, (error) => {
              console.error('Error loading MTL:', error);
              reject(error);
            });
          }
        } catch (error) {
          console.error('Error loading furniture model:', error);
          reject(error);
        }
      });
    },
  }
}
</script>
<!--<script setup>-->
<!--</script>-->
