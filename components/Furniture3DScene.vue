<template>
  <div id="customEnvironment" ref="customEnvironmentRef">
    <div class="flex-container">
      <div v-if="model" class="textures-container">
        <button @click="toggleTextureMenu">Toggle Textures</button>
        <transition-group name="fade">
          <div
            v-for="textureName in furnitureItem.textureNames"
            :key="textureName"
            v-if="model && showTexturesMenuFlag"
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
            <label> te twet we twe twe twe twe twe twet wet we twe</label>
          </div>
        </transition-group>
      </div>
      <v-spacer></v-spacer>
      <div class="hud-controls">
        <v-btn icon @click="zoomIn">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn icon @click="zoomOut">
          <v-icon>mdi-minus</v-icon>
        </v-btn>
        <v-btn icon @click="rotateModelX(2)">
          <v-icon>mdi-rotate-right</v-icon>
        </v-btn>
        <v-btn icon @click="rotateModelX(-2)">
          <v-icon>mdi-rotate-left</v-icon>
        </v-btn>
        <v-btn icon @click="togglePauseRotation">
          <v-icon>mdi-pause</v-icon>
        </v-btn>

      </div>
    </div>
  </div>
</template>


<script>
import {getFurnitureFileAsBlobUrl} from "assets/furniture-utils";

export default {
  props: {
    textureBlobUrls: {
      type: Object,
      required: true,
    },
    mtlUrl: {
      type: String,
      default: '',
    },
    modelUrl: {
      type: String,
      required: true,
    },
    furnitureItem: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      renderer: null,
      modelType: '',
      modelSize: null,
      cameraStartPosition: 4,
      THREE: null,
      scene:null,
      modelWrapper: null,
      model: null,
      activeTextures: {},
      showTexturesMenuFlag: false,
      paused: false
    };
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
      window.addEventListener('resize', this.updateRendererWhenResize);
    }
  },
  beforeDestroy() {
    if (process.client) {
      window.removeEventListener('resize', this.updateRendererWhenResize);
    }
  },
  methods: {
    findKeyByValue(obj, value) {
      return Object.keys(obj).find(key => obj[key] === value);
    },
    rotateModelX(direction) {
      if (!this.modelWrapper) return;

      const rotationSpeed = 0.1; // Adjust this value to change the rotation speed
      this.modelWrapper.rotation.x += rotationSpeed * direction;
    },
    modifyMTLToggleTexture(materials) {
      // Replace texture file paths with Blob URLs in materials
      for (const materialName in materials.materialsInfo) {
        const materialInfo = materials.materialsInfo[materialName];
        const textureMapProperties = ['map_kd', 'map_ks', 'map_ns', 'map_bump', 'refl'];
        textureMapProperties.forEach((property) => {
          const fileName = this.findKeyByValue(this.textureBlobUrls, materialInfo[property]);
          if (materialInfo[property] && this.textureBlobUrls[fileName]) {
            if (this.activeTextures[fileName]) {
              materialInfo[property] = this.textureBlobUrls[fileName];
            } else {
              materialInfo[property] = "";
            }
          }
        });
      }
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
    loadMtl(mtlLoader, mtlUrl) {
      return new Promise((resolve, reject) => {
        mtlLoader.load(mtlUrl, resolve, undefined, reject);
      });
    },
    loadObj(objLoader, modelUrl) {
      // The promise resolves with the loaded object
      // The promise rejects with an error during loading
      // The promise also reports progress updates during loading
      // See the three.js OBJLoader documentation for more details
      return new Promise((resolve, reject) => {
        objLoader.load(modelUrl, resolve, undefined, reject);
      });
    },
    async loadModel(OBJLoader, MTLLoader) {
      try {
        if (this.modelType === 'obj') {
          const objLoader = new OBJLoader();

          if (this.mtlUrl !== '') { // Updated the condition to check for an empty string
            const mtlLoader = new MTLLoader();
            const materials = await this.loadMtl(mtlLoader, this.mtlUrl);
            this.modifyMTLToggleTexture(materials);
            materials.preload();
            objLoader.setMaterials(materials);
          }
          const obj = await this.loadObj(objLoader, this.modelUrl);
          // Save the model reference
          this.model = obj;
          const { center, size } = this.centerModel(this.model);
          this.modelSize = size;
          this.modelWrapper.add(this.model);
        }
      } catch (error) {
        console.error('Error loading furniture model:', error.response.data);
      }
    },
    async loadBackgroundTexture(textureLoader) {
      const imageUrl = await getFurnitureFileAsBlobUrl(
        this.$axios,
        this.furnitureItem.id,
        this.furnitureItem.imageName);
      textureLoader.load(imageUrl ? imageUrl : '/environment-background.jpg', (background) => {
        this.scene.background = background;
      });
    },
    async initCustomEnvironment() {
      const THREE = this.THREE;
      const OBJLoader = THREE.OBJLoader;
      const MTLLoader = THREE.MTLLoader;
      const textureLoader = new THREE.TextureLoader();
      const container = document.getElementById('customEnvironment');
      if (!container) return; // If the container is not present, abort the function
      const scene = new THREE.Scene();
      this.scene = scene; // Save the scene object to update it later
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
      const animate = () => {
        requestAnimationFrame(animate);
        if (!this.paused && modelWrapper) {
          modelWrapper.rotation.y += Math.PI / 120;
        }
        renderer.render(scene, camera);
      };
      await this.loadBackgroundTexture(textureLoader);
      animate();
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
    addLights(scene) {
      const ambientLight = new THREE.AmbientLight(0x404040, 1); // soft white light
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
    },
    updateCameraPosition(modelSize) {
      const container = document.getElementById('customEnvironment');
      const camera = this.scene.getObjectByName('camera');
      if (!container || !camera || !modelSize) return;
      const aspectRatio = container.clientWidth / container.clientHeight;
      const fovRadians = camera.fov * (Math.PI / 180);
      const distanceWidth = Math.abs(modelSize.x / 2) / Math.tan(fovRadians / 2);
      const distanceHeight = Math.abs(modelSize.y / 2) / Math.tan(fovRadians / 2) / aspectRatio;
      // Add padding to the distance
      const padding = 1.2;
      const distanceWidthWithPadding = distanceWidth * padding;
      const distanceHeightWithPadding = distanceHeight * padding;
      // Choose the larger distance to fit the entire model in the view
      const distance = Math.max(distanceWidthWithPadding, distanceHeightWithPadding);
      // Update camera position
      camera.position.z = distance;
    },
    togglePauseRotation() {
      this.paused = !this.paused
    },
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
  },
};
</script>
<style scoped>
.hud-controls, .textures-container {
  background-color: rgba(255, 255, 255, 0.3);
  padding: 6px;
  border-radius: 5px;
}
.flex-container {
  display: flex;
  justify-content: space-between;
  position: absolute;
  align-items: flex-start;
  top: 0;
  z-index: 1;
  width: 100%;
}
#customEnvironment {
  width: 90%;
  height: 90%;
  position: relative;
}
.hud-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 90px;
}
.textures-container {
  justify-content: flex-start;
  max-width:250px;
  margin-right: 10px;
  word-break: break-word;
}
</style>
