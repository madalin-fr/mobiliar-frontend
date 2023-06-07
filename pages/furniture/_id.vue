<template>
    <ContainerFurnitureDetails class="container" :furnitureItem="furnitureItem" />
</template>

<script>
import ContainerFurnitureDetails from '@/components/ContainerFurnitureDetails.vue';

export default {
  components: {
    ContainerFurnitureDetails,
  },
  async asyncData({ $axios, params }) {
    const furnitureItem = await $axios.$get(`/api/furniture/${params.id}`);
    return { furnitureItem };
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
