<template>
  <nuxt />
</template>



<!--<template>-->
<!--  <v-app>-->
<!--    <v-app-bar app>-->
<!--      <v-toolbar-title>Mobili-AR Marketplace</v-toolbar-title>-->
<!--      <v-spacer></v-spacer>-->
<!--      <v-btn text>About</v-btn>-->
<!--      <v-btn icon @click="toggleDarkMode">-->
<!--        <v-icon>{{ darkMode ? 'mdi-moon-waning-crescent' : 'mdi-white-balance-sunny' }}</v-icon>-->
<!--      </v-btn>-->
<!--    </v-app-bar>-->

<!--    <v-main>-->
<!--      <v-container fluid>-->
<!--        <nuxt />-->
<!--      </v-container>-->
<!--    </v-main>-->

<!--    <v-footer app>-->
<!--      <v-container>-->
<!--        <span>&copy; 2023 Furniture Store</span>-->
<!--      </v-container>-->
<!--    </v-footer>-->
<!--  </v-app>-->
<!--</template>-->
<!--<script>-->
<!--export default {-->
<!--  name: 'DefaultLayout',-->
<!--  computed: {-->
<!--    darkMode: {-->
<!--      get() {-->
<!--        return this.$store.getters["darkMode/getDarkMode"];-->
<!--      },-->
<!--      set(newVal) {-->
<!--        this.$store.commit('darkMode/setDarkMode', newVal);-->
<!--      },-->
<!--    },-->
<!--  },-->
<!--  beforeCreate() {-->
<!--    const storedDarkMode = this.$cookies.get('mobiliar.darkmode');-->
<!--    if (storedDarkMode !== undefined) {-->
<!--      this.$store.commit('darkMode/setDarkMode', storedDarkMode);-->
<!--    } else {-->
<!--      this.$store.commit('darkMode/setDarkMode', true);-->
<!--    }-->
<!--    this.$vuetify.theme.dark = this.$store.getters["darkMode/getDarkMode"];-->
<!--  },-->
<!--  watch: {-->
<!--    darkMode(newVal) {-->
<!--      this.$vuetify.theme.dark = newVal;-->
<!--    },-->
<!--  },-->
<!--  methods: {-->
<!--    toggleDarkMode() {-->
<!--      this.$store.commit('darkMode/toggleDarkMode');-->
<!--    },-->
<!--  },-->
<!--};-->
<!--</script>-->
