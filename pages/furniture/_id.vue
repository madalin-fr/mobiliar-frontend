<template>
    <FurnitureItemDetails class="container" :furnitureItem="furnitureItem" />
</template>
<script>
import FurnitureItemDetails from '@/components/FurnitureItemDetails.vue';
export default {
  components: {
    FurnitureItemDetails,
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
