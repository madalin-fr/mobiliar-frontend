import Vue from 'vue';
import 'aframe-ar';

Vue.config.ignoredElements = [
  'a-scene',
  'a-box',
  'a-marker',
  'a-entity',
  // ... other A-Frame elements
];
