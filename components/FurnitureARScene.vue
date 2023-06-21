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
        </div>
      <a-scene
        arjs
        gesture-detector
        renderer="logarithmicDepthBuffer: true;"
      >
        <a-entity light="type: ambient; color: #CCC;intensity:0.5"
        ></a-entity>
        <a-marker
          preset="hiro"
          raycaster="objects: .clickable"
          emitevents="true"
          cursor="fuse: false; rayOrigin: mouse;"
        >
          <a-entity
            v-if="!loading"
            :obj-model="'obj: url(' + modelUrl + '); mtl: url(' + mtlUrl + ')'"
          >
          </a-entity>
        </a-marker>
        <a-entity camera></a-entity>
      </a-scene>
    </div>
  </client-only>
</template>

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
  top: 0;
  left: 0;
  margin-left:1em;
  margin-top:1em;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.go-back-button {
  padding: 0.25em;
  border-radius: 4px;
  border: none;
  background: white;
  color: black;
  min-width:58px;
  min-height:24px;
}

</style>

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
    },
  },
  methods: {
    stopAR() {
      location.reload();
    }
  },
  beforeDestroy() {
    location.reload();
  },
};
</script>
