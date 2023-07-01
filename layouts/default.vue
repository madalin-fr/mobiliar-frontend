<template>
  <v-app>
    <v-app-bar app>
      <!-- Add the GitHub icon button -->
      <v-btn
        icon
        href="https://github.com/madalin-fr/mobiliar-frontend"
        target="_blank"
        rel="noopener noreferrer"
      >
        <v-icon>mdi-github</v-icon>
      </v-btn>

      <v-toolbar-title
        @click="$router.push('/')"
        style="cursor: pointer"
      >
        Mobili-AR Marketplace
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Add the drop-down menu for logged-in user -->
      <v-menu v-if="loggedIn" open-on-hover offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">Menu</v-btn>
        </template>
        <v-list>

          <v-list-item @click="$router.push('/create-furniture')">
            <v-list-item-title>Create furniture</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>Log out</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-list-item v-if="userName" class="user-menu-item">
          <v-list-item-icon class="mr-1">
            <v-icon>mdi-account</v-icon>
          </v-list-item-icon>
          <span>{{ userName }}</span>
        </v-list-item>
      </v-menu>

      <v-btn v-if="!loggedIn" text to="/login">Login</v-btn>

      <v-btn icon @click="toggleDarkMode">
        <v-icon>{{
            darkMode
              ? 'mdi-moon-waning-crescent'
              : 'mdi-white-balance-sunny'
          }}</v-icon>
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
  data() {
    return {
      userName: null,
    };
  },
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
  async created() {
    if (this.loggedIn) {
      await this.fetchUserName();
    }
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
    async fetchUserName() {
      if (!this.loggedIn) {
        return;
      }
      const userEmail = this.$auth.user.email;

      const apiEndpoint = '/api/auth/get-name-by-email';
      try {
        const response = await this.$axios.get(apiEndpoint, { params: { email: userEmail } })
        if (response.status === 200) {
          this.userName = response.data;
        } else {
          console.error('Error fetching user name:', response);
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    }
  }
}
</script>

<style scoped>
.user-menu-item {
  position: relative;
  display: flex;
  justify-content: flex-end;
}
</style>
