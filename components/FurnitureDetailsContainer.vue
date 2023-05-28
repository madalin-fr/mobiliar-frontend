<template>
  <div>
    <h1>{{ furnitureItem.name }}</h1>
    <p>{{ furnitureItem.description }}</p>
    <p>Price: ${{ furnitureItem.price }}</p>
    <button @click="toggleAR">Toggle AR/Webcam</button>
    <button @click="showCustomEnvironment">View in Custom Environment</button>
    <client-only v-if="showAR">
      <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: true">
        <a-marker preset="hiro">
          <a-entity
            v-if="modelType === 'gltf' || modelType === 'glb'"
            :gltf-model="`${getFurnitureFileUrl(furnitureItem.id, furnitureItem.modelName)}`"
            position="0 0 0"
            scale="0.05 0.05 0.05"
          ></a-entity>
          <a-entity
            v-if="modelType === 'obj'"
            :obj-model="`obj:${getFurnitureFileUrl(furnitureItem.id, furnitureItem.modelName)};mtl:${getFurnitureFileUrl(furnitureItem.id, furnitureItem.materialName)}`"
            position="0 0 0"
            scale="0.05 0.05 0.05"
          ></a-entity>
        </a-marker>
        <a-entity camera></a-entity>
      </a-scene>
    </client-only>
    <div v-else ref="customEnvironment" id="customEnvironment">
      <button @click="moveObject(-1)">+</button>
      <button @click="moveObject(1)">-</button>
    </div>
  </div>
</template>
<style scoped>
#customEnvironment, a-scene {
  width: 100%;
  height: calc(100vw * 9 / 16);
  max-height: 100%;
}
</style>

<script>
export default {
  props: {
    furnitureItem: Object,
  },
  data() {
    return {
      showAR: false,
      modelType: '',
      THREE: null,
    };
  },
  async mounted() {
    if (process.client) {
      this.THREE = window.AFRAME.THREE;
      this.modelType = this.furnitureItem.modelType;
      await this.initCustomEnvironment();
    }
  },
  methods: {
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
        const response = await this.$axios.get(`/api/furniture/${id}/${fileName}`, {
          responseType: 'blob',
        });

        return URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error fetching furniture file:', error);
        return '';
      }
    },
    async initCustomEnvironment() {
      const THREE = this.THREE;
      const OBJLoader = THREE.OBJLoader;
      const GLTFLoader = THREE.GLTFLoader;
      const MTLLoader = THREE.MTLLoader;

      const container = this.$refs.customEnvironment;
      if (!container) return;
      const scene = new THREE.Scene();
      const aspectRatio = container.clientWidth / container.clientHeight;
      const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);

      const renderer = new THREE.WebGLRenderer({antialias: true});

      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      const modelGroup = new THREE.Group();
      scene.add(modelGroup);

      const resizeCanvas = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }

      window.addEventListener('resize', resizeCanvas);

      const loadTextures = async () => {
        const textureLoader = new THREE.TextureLoader();
        const textures = {};

        if (this.furnitureItem.baseColorName) {
          const baseColorUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.baseColorName);
          textures.baseColorTexture = textureLoader.load(baseColorUrl);
        }

        if (this.furnitureItem.roughnessName) {
          const roughnessUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.roughnessName);
          textures.roughnessTexture = textureLoader.load(roughnessUrl);
        }

        if (this.furnitureItem.normalName) {
          const normalUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.normalName);
          textures.normalTexture = textureLoader.load(normalUrl);
        }

        return textures;
      };

      const applyTextures = (obj, textures) => {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (textures.baseColorTexture) {
              child.material.map = textures.baseColorTexture;
            }
            if (textures.roughnessTexture) {
              child.material.roughnessMap = textures.roughnessTexture;
            }
            if (textures.normalTexture) {
              child.material.normalMap = textures.normalTexture;
            }
            child.material.needsUpdate = true;
          }
        });
      };

      const addModelToScene = (model) => {
        applyTextures(model, textures);
        modelGroup.add(model);

        // Set the model to the center
        modelGroup.position.set(0, 0, 0);

        // Adjust camera position
        const bbox = new THREE.Box3().setFromObject(modelGroup);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        camera.position.set(center.x, center.y, center.z + 2 * bbox.max.z / Math.tan((camera.fov / 2) * Math.PI / 180));

        // Rotate the model on x-axis
        const rotationSpeed = (2 * Math.PI) / 20; // 360 degrees in 20 seconds
        const animate = () => {
          requestAnimationFrame(animate);
          modelGroup.rotateY(rotationSpeed / 60); // Assuming 60 FPS
          renderer.render(scene, camera);
        };
        animate();
      };

      const textures = await loadTextures();

      if (this.modelType === 'gltf' || this.modelType === 'glb') {
        const loader = new GLTFLoader();

        const url = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.modelName);
        loader.load(url, (gltf) => {
          if (this.furnitureItem.binName) {
            gltf.parser.getDependency('buffer', 0).then((buffer) => {
              buffer.copy(new THREE.FileLoader().parse(url));
            });
          }
          addModelToScene(gltf.scene);
        });
      } else if (this.modelType === 'obj') {
        const loader = new OBJLoader();

        const objUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.ffurnitureItem.modelName);
        const mtlUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.materialName);
        loader.load(objUrl, (obj) => {
          if (this.furnitureItem.materialName) {
            const materialLoader = new MTLLoader();
            materialLoader.load(mtlUrl, (materials) => {
              materials.preload();
              obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.material = materials;
                }
              });
            });
          }
          addModelToScene(obj);
        });
      }

      // Add a background with a blurred environment
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load('/environment-background.jpg', (background) => {
        scene.background = background;
      });
    },
    scaleModel(factor) {
      this.modelGroup.scale.multiplyScalar(factor);
    },

    scaleModelUp() {
      this.scaleModel(1.1); // Increase the scale by 10%
    },

    scaleModelDown() {
      this.scaleModel(0.9); // Decrease the scale by 10%
    }
  },
};
</script>
