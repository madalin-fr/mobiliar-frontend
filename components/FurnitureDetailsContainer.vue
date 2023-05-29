<template>
  <div class="parent-container">
    <FurnitureInfo :furnitureItem="furnitureItem" />
    <FurnitureViewToggle @toggle-view="toggleAR" />
    <FurnitureAR v-if="showAR" :furnitureItem="furnitureItem" />
    <FurnitureCustomEnvironment v-else :furnitureItem="furnitureItem" />
  </div>
</template>

<style scoped>
.parent-container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto auto 1fr;
}

/* Make sure the FurnitureAR and FurnitureCustomEnvironment components fill the entire grid cell */
.parent-container > :nth-child(3) {
  width: 100%;
  height: 100%;
}
</style>
