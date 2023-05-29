<!--<template>-->
<!--  <div>-->
<!--    <h1>{{ furnitureItem.name }}</h1>-->
<!--    <p>{{ furnitureItem.description }}</p>-->
<!--    <p>Price: ${{ furnitureItem.price }}</p>-->
<!--    <button @click="toggleAR">Toggle AR/Webcam</button>-->
<!--    <button @click="showCustomEnvironment">View in Custom Environment</button>-->
<!--    <client-only v-if="showAR">-->
<!--      <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: true">-->
<!--        <a-marker preset="hiro">-->
<!--          <a-entity-->
<!--            v-if="modelType === 'gltf' || modelType === 'glb'"-->
<!--            :gltf-model="`${getFurnitureFileUrl(furnitureItem.id, furnitureItem.modelName)}`"-->
<!--            position="0 0 0"-->
<!--            scale="0.05 0.05 0.05"-->
<!--          ></a-entity>-->
<!--          <a-entity-->
<!--            v-if="modelType === 'obj'"-->
<!--            :obj-model="`obj:${getFurnitureFileUrl(furnitureItem.id, furnitureItem.modelName)};mtl:${getFurnitureFileUrl(furnitureItem.id, furnitureItem.materialName)}`"-->
<!--            position="0 0 0"-->
<!--            scale="0.05 0.05 0.05"-->
<!--          ></a-entity>-->
<!--        </a-marker>-->
<!--        <a-entity camera></a-entity>-->
<!--      </a-scene>-->
<!--    </client-only>-->
<!--    <div v-else id="customEnvironment"></div>-->
<!--  </div>-->
<!--</template>-->

<!--<style scoped>-->
<!--#customEnvironment, a-scene {-->
<!--  width: 100%;-->
<!--  height: calc(100vw * 9 / 16);-->
<!--  max-height: 100%;-->
<!--}-->
<!--</style>-->

<!--<script>-->
<!--export default {-->
<!--  props: {-->
<!--    furnitureItem: Object,-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      showAR: false,-->
<!--      modelType: '',-->
<!--      THREE: null,-->
<!--    };-->
<!--  },-->
<!--  async mounted() {-->
<!--    if (process.client) {-->
<!--      this.THREE = window.AFRAME.THREE;-->
<!--      this.modelType = this.furnitureItem.modelType;-->
<!--      await this.initCustomEnvironment();-->
<!--    }-->
<!--  },-->
<!--  methods: {-->
<!--    toggleAR() {-->
<!--      this.showAR = !this.showAR;-->
<!--      this.$nextTick(() => {-->
<!--        if (!this.showAR) {-->
<!--          this.initCustomEnvironment();-->
<!--        }-->
<!--      });-->
<!--    },-->
<!--    async getFurnitureFileUrl(id, fileName) {-->
<!--      try {-->
<!--        const response = await this.$axios.get(`/api/furniture/${id}/${fileName}`, {-->
<!--          responseType: 'blob',-->
<!--        });-->

<!--        return URL.createObjectURL(response.data);-->
<!--      } catch (error) {-->
<!--        console.error('Error fetching furniture file:', error);-->
<!--        return '';-->
<!--      }-->
<!--    },-->
<!--    async initCustomEnvironment() {-->
<!--      const THREE = this.THREE;-->
<!--      const OBJLoader = THREE.OBJLoader;-->
<!--      const GLTFLoader = THREE.GLTFLoader;-->
<!--      const MTLLoader = THREE.MTLLoader;-->

<!--      const container = document.getElementById('customEnvironment');-->
<!--      if (!container) return;-->
<!--      const scene = new THREE.Scene();-->
<!--      const camera = new THREE.PerspectiveCamera(75, container.clientWidth/ container.clientHeight, 0.1, 1000);-->

<!--      const renderer = new THREE.WebGLRenderer();-->

<!--      renderer.setSize(container.clientWidth, container.clientHeight);-->
<!--      container.appendChild(renderer.domElement);-->

<!--      if (this.modelType === 'gltf' || this.modelType === 'glb') {-->
<!--        const loader = new GLTFLoader();-->

<!--        const url = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.modelName);-->
<!--        loader.load(url, (gltf) => {-->
<!--          if (this.furnitureItem.binName) {-->
<!--            gltf.parser.getDependency('buffer', 0).then((buffer) => {-->
<!--              buffer.copy(new THREE.FileLoader().parse(url));-->
<!--            });-->
<!--          }-->
<!--          scene.add(gltf.scene);-->
<!--        });-->
<!--      } else if (this.modelType === 'obj') {-->

<!--        const loader = new OBJLoader();-->

<!--        const objUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.modelName);-->
<!--        const mtlUrl = await this.getFurnitureFileUrl(this.furnitureItem.id, this.furnitureItem.materialName);-->
<!--        loader.load(objUrl, (obj) => {-->
<!--          if (this.furnitureItem.materialName) {-->
<!--            const materialLoader = new MTLLoader();-->
<!--            materialLoader.load(url, (materials) => {-->
<!--              materials.preload();-->
<!--              obj.traverse((child) => {-->
<!--                if (child instanceof THREE.Mesh) {-->
<!--                  child.material = materials;-->
<!--                }-->
<!--              });-->
<!--            });-->
<!--          }-->
<!--          scene.add(obj);-->
<!--        });-->
<!--      }-->

<!--      camera.position.z = 5;-->

<!--      // Add a background with a blurred environment texture-->
<!--      const textureLoader = new THREE.TextureLoader();-->
<!--      textureLoader.load('/environment-background.jpg', (texture) => {-->
<!--        scene.background = texture;-->
<!--      });-->

<!--      function animate() {-->
<!--        requestAnimationFrame(animate);-->
<!--        renderer.render(scene,camera);-->
<!--      }-->

<!--      animate();-->
<!--    },-->
<!--    showCustomEnvironment() {-->
<!--      this.showAR = false;-->
<!--      this.initCustomEnvironment();-->
<!--    },-->
<!--  },-->
<!--};-->
<!--</script>-->
