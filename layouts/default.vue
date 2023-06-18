<template>
  <v-app>
    <v-app-bar app>
      <!-- Add the GitHub icon button -->
      <v-btn icon href="https://github.com/madalin-fr/mobiliar-frontend" target="_blank" rel="noopener noreferrer">
        <v-icon>mdi-github</v-icon>
      </v-btn>

        <v-toolbar-title @click="$router.push('/')"
                         style="cursor: pointer"
        >
          Mobili-AR Marketplace
        </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn v-if="loggedIn" text to="/create-furniture">Create furniture</v-btn>
      <v-btn v-if="!loggedIn" text to="/login">Login</v-btn>

      <v-btn v-if="loggedIn" text @click=logout >Log out</v-btn>

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
    loggedIn() {
      return this.$auth.loggedIn;
    },
    darkMode: {
      get() {
        return this.$store.getters["darkMode/getDarkMode"];
      },
      set(newVal) {
        this.$store.commit('darkMode/setDarkMode', newVal);
      },
    },
  },
  beforeCreate() {
    const storedDarkMode = this.$cookies.get('mobiliar.darkmode');
    if (storedDarkMode !== undefined) {
      this.$store.commit('darkMode/setDarkMode', storedDarkMode);
    } else {
      this.$store.commit('darkMode/setDarkMode', true);
    }
    this.$vuetify.theme.dark = this.$store.getters["darkMode/getDarkMode"];
  },
  watch: {
    darkMode(newVal) {
      this.$vuetify.theme.dark = newVal;
    },
  },

  methods: {
    toggleDarkMode() {
      this.$store.commit('darkMode/toggleDarkMode');
    },
    async logout() {
      await this.$auth.logout();
    },
  },

};
</script>
