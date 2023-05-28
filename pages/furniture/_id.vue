<template>
  <div>
    <h1>{{ furnitureItem.name }}</h1>
    <button @click="toggleAR">Toggle AR/Webcam</button>
    <div v-if="showAR">
      <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: false">
        <a-marker preset="hiro">
          <a-entity
            v-if="isGltfOrGlb"
            :gltf-model="`url(${furnitureItem.modelUrl})`"
            position="0 0 0"
            scale="0.05 0.05 0.05"
          ></a-entity>
          <a-entity
            v-else
            :obj-model="`obj:url(${furnitureItem.modelUrl});mtl:url(${furnitureItem.materialUrl})`"
            position="0 0 0"
            scale="0.05 0.05 0.05"
          ></a-entity>
        </a-marker>
        <a-entity camera></a-entity>
      </a-scene>
    </div>
    <div v-else id="customEnvironment" style="width: 100%; height: 500px;"></div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OBJLoader } from 'three-obj-loader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import 'arjs';
OBJLoader(THREE); // This extends the THREE namespace with the OBJLoader

export default {
  data() {
    return {
      showAR: true,
      furnitureItem: {},
      isGltfOrGlb: false,
    };
  },
  async asyncData({ $axios, params }) {
    const furnitureItem = await $axios.$get(`/api/furniture/${params.id}`);
    return { furnitureItem };
  },
  mounted() {
    this.isGltfOrGlb = this.furnitureItem.modelUrl.toLowerCase().endsWith('.gltf') ||
      this.furnitureItem.modelUrl.toLowerCase().endsWith('.glb');
    this.initCustomEnvironment();
  },
  methods: {
    toggleAR() {
      this.showAR = !this.showAR;
    },
    initCustomEnvironment() {
      const container = document.getElementById('customEnvironment');
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      if (this.isGltfOrGlb) {
        const loader = new GLTFLoader();

        loader.load(this.furnitureItem.modelUrl, (gltf) => {
          scene.add(gltf.scene);
        });
      } else {
        const loader = new THREE.OBJLoader();

        loader.load(this.furnitureItem.modelUrl, (obj) => {
          if (this.furnitureItem.materialUrl) {
            const materialLoader = new THREE.MTLLoader();
            materialLoader.load(this.furnitureItem.materialUrl, (materials) => {
              materials.preload();
              obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.material = materials;
                }
              });
            });
          }
          scene.add(obj);
        });
      }

      camera.position.z = 5;

      // Add a background with a blurred environment texture
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load('path/to/blurred-environment.jpg', (texture) => {
        scene.background = texture;
      });

      function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }

      animate();
    },
  },
};
</script>
