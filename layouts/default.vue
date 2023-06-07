<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Furniture Store</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text>About</v-btn>
      <v-btn text>Contact</v-btn>
      <v-btn text>Login</v-btn>
      <v-btn text>Register</v-btn>
      <v-btn icon @click="toggleDarkMode">
        <v-icon>{{ darkMode ? 'mdi-moon-waning-crescent' : 'mdi-white-balance-sunny' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>

    <v-footer app>
      <v-container>
        <span>&copy; 2023 Furniture Store</span>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  computed: {
    darkMode() {
      return this.$store.getters.getDarkMode;
    },
  },
  beforeCreate() {
    const storedDarkMode = this.$cookies.get('mobiliar.darkmode');
    this.$store.commit('setDarkMode', storedDarkMode);
    this.$vuetify.theme.dark = storedDarkMode;
  },
  watch: {
    darkMode(newVal) {
      this.$vuetify.theme.dark = newVal;
    },
  },
  methods: {
    toggleDarkMode() {
      this.$store.commit('toggleDarkMode');
    },
  },
};
</script>
