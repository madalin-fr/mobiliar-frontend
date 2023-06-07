<template>
  <div id="customEnvironment" ref="customEnvironmentRef" >
    <div class="hud-controls">
      <button class="hud-button zoom-in" @click="zoomIn" title="Zoom In">+</button>
      <button class="hud-button zoom-out" @click="zoomOut" title="Zoom Out">-</button>
    </div>
    <div v-if="model" class="textures-container">
      <button @click="toggleTextureMenu">Toggle Textures</button>
      <transition name="fade">
        <div
          v-show="showTexturesMenuFlag"
          v-for="textureName in furnitureItem.textureNames"
          :key="textureName"
          class="texture-item"
        >
          <input
            type="checkbox"
            :id="textureName"
            :value="textureName"
            checked
            @change="toggleTexture(textureName)"
          />
          <label :for="textureName">{{ textureName }}</label>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
#customEnvironment {
  width: 90%;
  height: 90%;
  position: relative;
}
.hud-controls {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 10px;
  right: 10px;
  z-index: 1;
}
.textures-container {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
}

.hud-button {
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  margin-bottom: 10px;
  cursor: pointer;
}
.hud-button:hover {
  background-color: #555;
}
</style>

<script>

export default {
  props: {
    furnitureItem: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      blobCache: {},
      showAR: false,
      renderer: null,
      modelType: '',
      modelSize: null,
      cameraStartPosition: 4,
      THREE: null,
      scene:null,
      composer:null,
      blurAmount: 0,
      modelWrapper: null,
      model: null,
      activeTextures: {},
      showTexturesMenuFlag: true,
    };
  },
  created() {
    if (process.client) {
      window.addEventListener('resize', this.updateRendererWhenResize);
    }
  },
  async mounted() {
    if (process.client) {
      this.THREE = window.AFRAME.THREE;
      this.modelType = this.furnitureItem.modelType;
      this.activeTextures = this.furnitureItem.textureNames.reduce((acc, name) => {
        acc[name] = true;
        return acc;
      }, {});
      await this.initCustomEnvironment();
    }
    this.updateRendererWhenResize();
  },
  beforeUnmount() {
    if (process.client) {
      window.removeEventListener('resize', this.updateRendererWhenResize);
    }
  },
  methods: {
    toggleTextureMenu() {
      this.showTexturesMenuFlag = !this.showTexturesMenuFlag;
    },
    async zoomIn() {
      const container = document.getElementById('customEnvironment');
      const camera = this.scene.getObjectByName('camera');
      if (!container || !camera) return;


      camera.position.z = Math.min(camera.position.z - 0.5, 10); // increase camera z position
    },
    async zoomOut() {

      const container = document.getElementById('customEnvironment');
      const camera = this.scene.getObjectByName('camera');
      if (!container || !camera) return;
      if(camera.position.z > 100) return;

      camera.position.z = Math.min(camera.position.z + 0.5, 10); // increase camera z position
    },
    updateRendererWhenResize() {
      const container = this.$refs.customEnvironmentRef;
      const renderer = this.renderer;
      if (renderer) {
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    },
    toggleAR() {
      this.showAR = !this.showAR;
      this.$nextTick(() => {
        if (!this.showAR) {
          this.initCustomEnvironment();
        }
      });
    },
    async toggleTexture(textureName) {
      if (!this.modelWrapper) return;
      this.activeTextures[textureName] = !this.activeTextures[textureName];

      // Remove the previously loaded model
      this.scene.remove(this.modelWrapper);

      this.modelWrapper.remove(this.model);
      // Load the model again with the updated active textures
      await this.loadModel(this.THREE.OBJLoader,this.THREE.MTLLoader);
      // Create a new model wrapper and add the model to it


      // Add the new model wrapper to the scene
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
    addLights(scene) {
      const ambientLight = new THREE.AmbientLight(0x404040, 1); // soft white light
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
    },

    centerModel(model) {
      const box = new this.THREE.Box3().setFromObject(model);
      const center = box.getCenter(new this.THREE.Vector3());
      const size = box.getSize(new this.THREE.Vector3());

      model.position.x += (model.position.x - center.x);
      model.position.y += (model.position.y - center.y);
      model.position.z += (model.position.z - center.z);

      return { center, size };
    },

    async loadBackgroundTexture(textureLoader) {
      // Add a background with a blurred environment
      textureLoader.load('/environment-background.jpg', (background) => {
        this.scene.background = background;
      });
    },

    async loadTextures(textureNames, furnitureItemId) {
      const textureMap = {};

      for (const textureName of textureNames) {
        const blobUrl = await this.getFurnitureFileUrl(furnitureItemId, textureName);
        const blobUrlObj = new URL(blobUrl);
        const pathname = blobUrlObj.pathname;
        const blobName = pathname.substring(pathname.lastIndexOf('/') + 1); // Extract the blobName from the URL
        textureMap[textureName] = blobName;
      }

      return textureMap;
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

    updateCameraPosition(modelSize) {
      const container = document.getElementById('customEnvironment');
      const camera = this.scene.getObjectByName('camera');
      if (!container || !camera || !modelSize) return;

      const aspectRatio = container.clientWidth / container.clientHeight;
      const fovRadians = camera.fov * (Math.PI / 180);
      const distanceWidth = Math.abs(modelSize.x / 2) / Math.tan(fovRadians / 2);
      const distanceHeight = Math.abs(modelSize.y / 2) / Math.tan(fovRadians / 2) / aspectRatio;

      // Choose the larger distance to fit the entire model in the view
      const distance = Math.max(distanceWidth, distanceHeight);

      // Update camera position
      camera.position.z = distance;
    },

    async initCustomEnvironment() {
      const THREE = this.THREE;
      const OBJLoader = THREE.OBJLoader;
      // const GLTFLoader = THREE.GLTFLoader;
      const MTLLoader = THREE.MTLLoader;
      const textureLoader = new THREE.TextureLoader();
      const container = document.getElementById('customEnvironment');
      if (!container) return;

      const scene = new THREE.Scene();
      this.scene = scene; // assign scene to data property

      const camera = new THREE.PerspectiveCamera(
        90, // field of view in degrees
        container.clientWidth / container.clientHeight, // aspect ratio
        0.1, // near clipping plane
        50// far clipping plane
      );
      camera.name = 'camera';
      camera.position.set(0, 0, this.cameraStartPosition); // Adjust the camera position to fit your scene
      scene.add(camera);

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);
      this.renderer = renderer;

      const modelWrapper = new this.THREE.Object3D();
      scene.add(modelWrapper);
      this.modelWrapper = modelWrapper;

      this.addLights(scene);

      await this.loadModel(OBJLoader,MTLLoader);

      // Center the camera on the model
      if (this.modelSize) {
        this.updateCameraPosition(this.modelSize);
      }


      await this.loadBackgroundTexture(textureLoader);

      const animate = () => {
        requestAnimationFrame(animate);
        if (modelWrapper) {
          modelWrapper.rotation.y += Math.PI / 120;
        }
        renderer.render(scene, camera);
      };

      animate();
    },
  },
};
</script>

