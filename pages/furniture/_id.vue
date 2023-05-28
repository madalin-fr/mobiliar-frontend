<template>
  <div>
    <FurnitureDetailsContainer :furnitureItem="furnitureItem" />
  </div>
</template>

<script>
import FurnitureDetailsContainer from '@/components/FurnitureDetailsContainer.vue';

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
