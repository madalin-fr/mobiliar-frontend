<template>
  <client-only>
    <div>
      <div class="arjs-loader" v-if="loading">
        <div>Loading, please wait...</div>
      </div>
      <div class="buttons">
        <v-btn color="white" @click="stopAR" class="go-back-button">
          <v-icon left>mdi-arrow-left</v-icon>
          Go back
        </v-btn>
        <v-btn color="white" @click="toggleRotation" class="toggle-rotation-button">
          <v-icon left>{{ rotationEnabled ? 'mdi-pause' : 'mdi-play' }}</v-icon>
          {{ rotationEnabled ? 'Pause Rotation' : 'Start Rotation' }}
        </v-btn>
      </div>
      <a-scene
        arjs
        gesture-detector
        renderer="logarithmicDepthBuffer: true;"
      >

        <a-marker
          preset="kanji"
          raycaster="objects: .clickable"
          emitevents="true"
          cursor="fuse: false; rayOrigin: mouse;"
        >
          <a-entity
            id="rotation-center"
            position="0 0 -0.5"
            :animation="rotationEnabled ? animationProperties : null"
            model-center="target: #model; size: 1"
          >
            <a-entity
              id="model"
              ref="modelElement"
            >
            </a-entity>
          </a-entity>
        </a-marker>
        <a-entity camera></a-entity>
      </a-scene>
    </div>
  </client-only>
</template>
<script>
export default {
  props: {
    furnitureItem: {
      type: Object,
      required: true,
    },
    mtlUrl: {
      type: String,
      required: true,
    },
    modelUrl: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      rotationEnabled: false,
      animationProperties: {
        property: 'rotation',
        to: '0 360 0',
        loop: true,
        dur: 10000,
        easing: 'linear',
      },
    };
  },
  watch: {
    loading(newVal) {
      // If the loading prop is false, load the model
      if (!newVal) {
        this.loadModel();
      }
    }
  },
  async mounted() {
    if(process.client) {
      AFRAME.registerComponent('model-center', {
        schema: {
          target: {type: 'selector'},
          size: {type: 'number', default: 1},
        },
        init: function () {
          this.el.addEventListener('model-loaded', () => {
            const target = this.data.target;
            const object3D = target.object3D;
            const box = new AFRAME.THREE.Box3().setFromObject(object3D);
            const center = box.getCenter(new AFRAME.THREE.Vector3());
            const size = box.getSize(new AFRAME.THREE.Vector3());
            // Calculate the scaling factor
            const maxSize = Math.max(size.x, size.y, size.z);
            const scaleFactor = this.data.size / maxSize;
            // Apply the scaling factor to the model
            object3D.scale.set(scaleFactor, scaleFactor, scaleFactor);
            // Update the object3D's position
            object3D.position.set(-center.x * scaleFactor, -center.y * scaleFactor, -center.z * scaleFactor);
          });
        },
      });
    }
  },
  methods: {
    stopAR() {
      location.reload();
    },
    toggleRotation() {
      this.rotationEnabled = !this.rotationEnabled;
    },
    async checkFileExists(url) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Range: 'bytes=0-100'
          }
        });
        return response.ok;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    // Load the model with or without MTL file
    async loadModel() {
      const model = this.$refs.modelElement;
      console.log(this.modelUrl);
      console.log(this.mtlUrl);
      if (await this.checkFileExists(this.mtlUrl) && this.mtlUrl !== '') {
        model.setAttribute('obj-model', `obj: url(${this.modelUrl}); mtl: url(${this.mtlUrl})`);
      } else {
        model.setAttribute('obj-model', `obj: url(${this.modelUrl})`);
      }
    },
  },
  beforeDestroy() {
    location.reload();
  },
};
</script>
<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

body {
  position: relative;
}

canvas,
video {
  display: block;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  object-fit: contain !important;
}

.arjs-loader {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.arjs-loader div {
  text-align: center;
  font-size: 1.25em;
  color: white;
}

.buttons {
  position: absolute;
  top: 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  width: 100%;
  padding: 0 1em;
}

.go-back-button {
  padding: 0.25em;
  border-radius: 4px;
  border: none;
  background: white;
  color: black;
  min-width: 58px;
  min-height: 24px;
  margin-right: auto;
}

.toggle-rotation-button {
  padding: 0.25em;
  border-radius: 4px;
  border: none;
  background: white;
  color: black;
  min-width: 58px;
  min-height: 24px;
}
</style>
