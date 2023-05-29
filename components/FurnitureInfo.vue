<template>
  <div>
    <h1>{{ furnitureItem.name }}</h1>
    <p>{{ furnitureItem.description }}</p>
    <p>Price: ${{ furnitureItem.price }}</p>
  </div>
</template>

<script>
export default {
  props: {
    furnitureItem: Object,
  },
};
</script>
