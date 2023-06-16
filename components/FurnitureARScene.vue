<template>
  <client-only>
    <div>
      <a-scene
        arjs
      >
        <a-entity light="type: ambient; color: #CCC;intensity:0.5"></a-entity>
        <a-marker preset="hiro">
          <a-entity

            obj-model="obj:url(/repaired.obj);mtl:url(/3dmodel.mtl)"></a-entity>
        </a-marker>
        <a-entity camera

        ></a-entity>
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
</style>

<script>
export default {
  layout: "fullscreen"
}
</script>
