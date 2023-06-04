<template>
  <div id="customEnvironment" ref="customEnvironmentRef" class="justify-centers">
    <div class="hud-controls">
      <button class="hud-button" @click="zoomIn" title="Zoom In">+</button>
      <button class="hud-button" @click="zoomOut" title="Zoom Out">-</button>
      <button class="hud-button" @click="increaseBlur" title="Increase Blur">Blur +</button>
    </div>
  </div>
</template>

<style scoped>
#customEnvironment {
  width: 80%;
  height: 100%;
  position: relative;
}
.hud-controls {
  position: absolute;
  top: 10px;
  right: 10px;
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
      showAR: false,
      modelType: '',
      modelScale: '0.05 0.05 0.05',
      cameraStartPosition: 4,
      THREE: null,
      scene:null,
      composer:null,
      blurAmount: 0,
      model: null,
    };
  },
  created() {
    if (process.client) {
      window.addEventListener('resize', this.updateCustomEnvironmentPadding);
    }
  },
  async mounted() {
    if (process.client) {
      this.THREE = window.AFRAME.THREE;
      this.modelType = this.furnitureItem.modelType;
      await this.initCustomEnvironment();
    }
    this.updateCustomEnvironmentPadding();
  },
  beforeUnmount() {
    if (process.client) {
      window.removeEventListener('resize', this.updateCustomEnvironmentPadding);
    }
  },
  methods: {
    updateCustomEnvironmentPadding() {
      const container = this.$refs.customEnvironmentRef;
      const width = container.clientWidth;
      const height = width * (9/16);
      container.style.paddingBottom = `${height}px`;
    },
    toggleAR() {
      this.showAR = !this.showAR;
      this.$nextTick(() => {
        if (!this.showAR) {
          this.initCustomEnvironment();
        }
      });
    },
    async getFurnitureFileUrl(id, fileName) {
      try {
        const response = await this.$axios.get(`/api/furniture/${id}/${fileName}`, {responseType: 'blob'});
        return URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error fetching furniture file:', error);
        return '';
      }
    },
    async increaseBlur() {
      if (this.blurAmount >= 5) {
        console.log("Maximum blur reached.");
        return;
      }

      this.blurAmount += 1;

      const blurPass = new BlurPass(new THREE.Vector2(this.blurAmount, this.blurAmount));
      this.composer.addPass(blurPass);
      this.composer.render();
    },
    async zoomIn() {
      const container = document.getElementById('customEnvironment');
      const camera = this.scene.getObjectByName('camera');
      if (!container || !camera) return;
      if(camera.position.z <= this.cameraStartPosition) return;


      camera.position.z = Math.min(camera.position.z - 2.1, 10); // increase camera z position
    },
    async zoomOut() {

      const container = document.getElementById('customEnvironment');
      const camera = this.scene.getObjectByName('camera');
      if (!container || !camera) return;
      if(camera.position.z > 100) return;

      camera.position.z = Math.min(camera.position.z + 2.1, 10); // increase camera z position
    },

    centerModel(model) {
      const box = new this.THREE.Box3().setFromObject(model);
      const center = box.getCenter(new this.THREE.Vector3());

      model.position.x += (model.position.x - center.x);
      model.position.y += (model.position.y - center.y);
      model.position.z += (model.position.z - center.z);
    },
    async loadTextures(textureFileNames, furnitureItemId) {
      const textureBlobUrls = {};
      // Load all texture files and store their Blob URLs
      for (const textureFileName of textureFileNames) {
        textureBlobUrls[textureFileName] =  await this.getFurnitureFileUrl(furnitureItemId, textureFileName);
      }

      return textureBlobUrls;
    },



    async initCustomEnvironment() {
      const THREE = this.THREE;
      const OBJLoader = THREE.OBJLoader;
      const GLTFLoader = THREE.GLTFLoader;
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

      const modelWrapper = new this.THREE.Object3D();
      scene.add(modelWrapper);

      // Load model
      try {
        if (this.modelType === 'gltf' || this.modelType === 'glb') {
          const loader = new GLTFLoader();
          const modelUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.modelName);

          if (this.modelType === 'gltf') {
            // Retrieve the .bin file URL using this.furnitureItem.binName
            const binFileName = this.furnitureItem.binName;
            const binBlobUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, binFileName);

            loader.load(modelUrl, async (gltf) => {
              // Replace the .bin file URI in the glTF JSON with the Blob URL
              gltf.parser.getDependency('buffer').then(() => {
                gltf.parser.json.buffers[0].uri = binBlobUrl;
                gltf.parser.getDependencies('texture').then(() => {
                  this.model = gltf.scene;
                  this.centerModel(this.model);
                  modelWrapper.add(this.model);
                });
              });
            }, undefined, (error) => {
              console.error('Error loading GLTF model:', error);
            });
          } else if (this.modelType === 'glb') {
            // Load all texture files and store their Blob URLs
            const textureBlobUrls = await this.loadTextures(this.furnitureItem.textureNames, this.furnitureItem.id);

            // Load the .glb file directly using GLTFLoader
            loader.load(modelUrl, async (gltf) => {
              // Replace the existing texture files in the GLB model with the new Blob URLs
              gltf.parser.getDependencies('texture').then((textures) => {
                textures.forEach((texture) => {
                  const textureFileName = texture.image.src.split('/').pop();
                  const newTextureBlobUrl = textureBlobUrls[textureFileName];
                  if (newTextureBlobUrl) {
                    texture.image.src = newTextureBlobUrl;
                  }
                });
              });

              this.model = gltf.scene;
              this.centerModel(this.model);
              modelWrapper.add(this.model);
            }, undefined, (error) => {
              console.error('Error loading GLB model:', error);
            });
          }
        }
        else if (this.modelType === 'obj') {
          const loader = new OBJLoader();
          const modelUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.modelName);
          const mtlUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.materialName);

          const mtlLoader = new MTLLoader();
          mtlLoader.load(mtlUrl, async (materials) => {
            materials.preload();
            loader.setMaterials(materials);
            loader.load(modelUrl, async (obj) => {
              // Load textures
              const textureBlobUrls = await this.loadTextures(this.furnitureItem.textureNames, this.furnitureItem.id);

              // obj.traverse((child) => {
              //   if (child.isMesh) {
              //     if (Array.isArray(child.material)) {
              //       child.material = child.material.map((material) => {
              //         if (material.map && textureBlobUrls[material.map.name]) {
              //           material.map = textureLoader.load(textureBlobUrls[material.map.name]);
              //         }
              //         return material;
              //       });
              //     } else {
              //       if (child.material.map && textureBlobUrls[child.material.map.name]) {
              //         child.material.map = textureLoader.load(textureBlobUrls[child.material.map.name]);
              //       }
              //     }
              //   }
              // });
              // Save the model reference
              this.model = obj;

              this.centerModel(this.model);

              modelWrapper.add(this.model);
            }, undefined, (error) => {
              console.error('Error loading OBJ model:', error);
            });
          }, undefined, (error) => {
            console.error('Error loading MTL:', error);
          });
        }
      } catch (error) {
        console.error('Error loading furniture model:', error);
      }




      // Add a background with a blurred environment
      textureLoader.load('/environment-background.jpg', (background) => {
        scene.background = background;
      });


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

