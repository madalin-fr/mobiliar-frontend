<template>
    <FurnitureDetailsContainer class="container" :furnitureItem="furnitureItem" />
</template>

<script>
import FurnitureDetailsContainer from '@/components/ContainerFurnitureDetails.vue';

export default {
  components: {
    FurnitureDetailsContainer,
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
