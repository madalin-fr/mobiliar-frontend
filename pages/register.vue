<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
        <v-card>
          <v-card-title>
            <span class="headline">Register</span>
          </v-card-title>
          <v-card-text>
            <RegisterCustomerForm ref="registerForm" @register="register" :loading="loading"
                                  :account-exists="accountExists"
                                  :show-success="showSuccess"
                                  :get-dark-mode="getDarkMode" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import RegisterCustomerForm from '@/components/RegisterCustomerForm.vue';
export default {
  auth: 'guest',
  components: {
    RegisterCustomerForm: RegisterCustomerForm,
  },
  data() {
    return {
      loading: false,
      showSuccess: false,
      phoneUsed: false,
      accountExists: {
        email: false,
        phone: false,
      },
    };
  },
  computed: {
    getDarkMode() {
      return this.$store.getters['darkMode/getDarkMode'];
    },
  },
  methods: {
    async register(data) {
      this.loading = true; // Show the progress bar
      // 1. Check if the email or phone number is already used
      let accountExistsResponse;
        try {
          accountExistsResponse = await this.$axios.get('/api/auth/check-account-exists', {
            params: {
              email: data.email,
              phoneNumber: data.phoneNumber,
            },
          });
        }
        catch (error) {
          console.error('Error checking if account exists:', error.response.data);
          this.loading = false;
          return;
        }
        this.accountExists.email = accountExistsResponse.data.emailExists;
        this.accountExists.phone = accountExistsResponse.data.phoneExists;
        if (this.accountExists.email) {
          this.$refs.registerForm.setEmailUsed(true);
          this.loading = false;
          return;
        }
        if (this.accountExists.phone) {
          this.$refs.registerForm.setPhoneUsed(true);
          this.loading = false;
          return;
        }
        // 2. Register the user
        const registerData = new FormData();
        registerData.append('name', data.name);
        registerData.append('email', data.email);
        registerData.append('password', data.password);
        registerData.append('address1', data.address1);
        registerData.append('address2', data.address2);
        registerData.append('phoneNumber', data.phoneNumber);
        try {
          await this.$axios.post('/api/auth/register', registerData);
        } catch (error) {
          console.error('Error registering user:', error.response.data);
          this.loading = false;
          return;
        }
        // 3. Send the activation email
        const frontendDomain = window.location.origin;
        const accountActivationRoute = "/activate-account";
        const activationUrl = `${frontendDomain}${accountActivationRoute}`;
        const activateEmailData = new FormData();
        activateEmailData.append('email', data.email);
        activateEmailData.append('activationUrl', activationUrl);
        try {
          await this.$axios.post('/api/auth/send-activation-email', activateEmailData);
        }
        catch (error) {
          console.error('Error sending activation email:', error.response.data);
          this.loading = false;
          return;
        }
        // 4. Show the success
        this.loading = false;
        this.showSuccess = true;
        setTimeout(() => {
          this.$router.push('/');
        }, 3000);
    },
  },
};
</script>
