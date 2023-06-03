<template>
    <div id="customEnvironment" ref="customEnvironmentRef" class="justify-centers">
      <button @click="increaseScale">+</button>
      <button @click="decreaseScale">-</button>
    </div>
</template>

<style scoped>
#customEnvironment {
  width: 80%;
  height: 100%;
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
      THREE: null,
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
    increaseScale() {
      const scaleValues = this.modelScale.split(' ').map(Number);
      const newScaleValues = scaleValues.map((value) => value + 10.01);
      this.modelScale = newScaleValues.join(' ');
    },

    decreaseScale() {
      const scaleValues = this.modelScale.split(' ').map(Number);
      const newScaleValues = scaleValues.map((value) => value - 10.01);
      this.modelScale = newScaleValues.join(' ');
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
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);


      try {
        if (this.modelType === 'gltf' || this.modelType === 'glb') {
          const loader = new GLTFLoader();
          console.log(this.furnitureItem.id, this.furnitureItem.modelName);

          const url = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.modelName);

          loader.load(url, async (gltf) => {
            if (this.furnitureItem.binName) {
              const buffer = await gltf.parser.getDependency('buffer', 0);
              buffer.copy(new THREE.FileLoader().parse(url));
            }

            // // Load textures
            // const textureUrls = await Promise.all(
            //   Array.from(this.furnitureItem.textureNames).map((textureName) =>
            //     this.getFurnitureFileUrl(this.furnitureItem.id, textureName)
            //   )
            // );
            //
            // // Apply textures to the material
            // gltf.scene.traverse((child) => {
            //   if (child.isMesh) {
            //     if (Array.isArray(child.material)) {
            //       child.material = child.material.map((material) => {
            //         const textureUrl = textureUrls[Math.floor(Math.random() * textureUrls.length)];
            //         material.map = textureLoader.load(textureUrl);
            //         return material;
            //       });
            //     } else {
            //       const textureUrl = textureUrls[Math.floor(Math.random() * textureUrls.length)];
            //       child.material.map = textureLoader.load(textureUrl);
            //     }
            //   }
            // });

            scene.add(gltf.scene);
          }, undefined, (error) => {
            console.error('Error loading GLTF model:', error);
          });
        }
        else if (this.modelType === 'obj') {
          const loader = new OBJLoader();
          const objUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.modelName);
          const mtlUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.materialName);

          const mtlLoader = new MTLLoader();
          mtlLoader.load(mtlUrl, (materials) => {
            materials.preload();
            loader.setMaterials(materials);
            loader.load(objUrl, (obj) => {
              // Load textures
              const textureUrls = Array.from(this.furnitureItem.textureNames).map((textureName) =>
                this.getFurnitureFileUrl(this.furnitureItem.id, textureName)
              );

              obj.traverse((child) => {
                if (child.isMesh) {
                  if (Array.isArray(child.material)) {
                    child.material = child.material.map((material) => {
                      const textureUrl = textureUrls[Math.floor(Math.random() * textureUrls.length)];
                      material.map = textureLoader.load(textureUrl);
                      return material;
                    });
                  } else {
                    const textureUrl = textureUrls[Math.floor(Math.random() * textureUrls.length)];
                    child.material.map = textureLoader.load(textureUrl);
                  }
                }
              });

              scene.add(obj);
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

      camera.position.z = 5;

      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };

      animate();
    },
  },
};
</script>

