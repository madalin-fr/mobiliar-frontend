<template>
  <client-only>
    <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: true">
      <a-marker preset="hiro">
        <a-entity
          v-if="modelType === 'gltf' || modelType === 'glb'"
          :gltf-model="`${getFurnitureFileUrl(furnitureItem.id, furnitureItem.modelName)}`"
          position="0 0 0"
          :scale="scale"
        ></a-entity>
        <a-entity
          v-if="modelType === 'obj'"
          :obj-model="`obj:${getFurnitureFileUrl(furnitureItem.id, furnitureItem.modelName)};mtl:${getFurnitureFileUrl(furnitureItem.id, furnitureItem.materialName)}`"
          position="0 0 0"
          :scale="scale"
        ></a-entity>
      </a-marker>
      <a-entity camera></a-entity>
    </a-scene>
  </client-only>
</template>

<style>
a-scene {
  width: 100%;
  height: calc(100vw * 9 / 16);
  max-height: 100%;
}
</style>

<script>
export default {
  props: {
    furnitureItem: Object,
    modelType: String,
    getFurnitureFileUrl: Function,
    scale: String,
  },
};
</script>

