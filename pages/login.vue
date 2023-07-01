<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center">
        <h1 class="display-1">Discover Your Perfect Furniture</h1>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-snackbar v-model="alertVisible" :timeout="5000" :color="alertColor" top>
          {{ alertMessage }}
          <v-btn v-if="showResendButton" small color="warning" text @click="sendActivationEmail">
            Resend Activation Email
          </v-btn>
        </v-snackbar>
        <v-card>
          <v-card-title>Login</v-card-title>
          <v-card-text>
            <v-form ref="loginForm">
              <v-alert :value="activationEmailSent" color="success" dense dismissible>
                Activation email has been sent.
              </v-alert>
              <v-text-field
                label="Email"
                type="email"
                v-model="email"
                :rules="[required, validEmail]"
              ></v-text-field>
              <v-text-field
                label="Password"
                type="password"
                v-model="password"
                :rules="[required]"
              ></v-text-field>
              <v-btn color="primary" block @click="login">Login</v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text small color="primary" @click="$router.push('/request-reset-password')">
              Reset Password
            </v-btn>
            <v-btn text small color="primary" @click="$router.push('/register')">
              Register
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  auth: 'guest',
  data() {
    return {
      email: '',
      password: '',
      alertVisible: false,
      alertMessage: '',
      alertColor: 'info',
      accountActivated: true,
      activationEmailSent: false,
      required: (value) => !!value || 'This field is required',
      validEmail: (value) => {
        const emailPattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        return emailPattern.test(value) || 'E-mail must be valid';
      },
    };
  },
  computed: {
    showResendButton() {
      return this.alertMessage === 'Account not activated';
    },
  },
  methods: {
    async login()
    {
      console.log(window.location.origin);
      // Validate the form before proceeding
      if (this.$refs.loginForm.validate()) {
        try {
          let formdata = new FormData();
          formdata.append('email', this.email);

          // Check if the account is activated
          const activatedResponse = await this.$axios.post('/api/auth/is-account-activated', formdata);
          if (activatedResponse.data.activatedAccount) {
            await this.$auth.loginWith('local', {
              data: {
                email: this.email,
                password: this.password,
              },
            });
            // Redirect to the desired page after successful login
            this.$router.push('/furniture-list');
          } else {
            this.alertMessage = 'Account not activated';
            this.alertColor = 'error';
            this.alertVisible = true;
            this.accountActivated = false;
          }
        } catch (error) {
          console.error('Error authenticating:', error.response.data);
          if (error.response && error.response.status === 401) {
            // Handle invalid email or password
            this.alertMessage = 'Invalid email or password';
            this.alertColor = 'error';
          } else {
            // Handle other errors
            this.alertMessage = "Login failed: " + error.response.data;
            this.alertColor = 'error';
          }
          this.alertVisible = true;
        }
      }
    }
,
    async sendActivationEmail() {
      // 3. Send the activation email
      const frontendDomain = window.location.origin;
      const accountActivationRoute = "/activate-account";
      const activationUrl = `${frontendDomain}${accountActivationRoute}`;
      const activateEmailData = new FormData();
      activateEmailData.append('email', this.email);
      activateEmailData.append('activationUrl', activationUrl);
      try {
        await this.$axios.post('/api/auth/send-activation-email', activateEmailData);
        this.activationEmailSent = true;
      } catch (error) {
        console.error('Error sending activation email:', error.response.data);
      }
    },
  }
};
</script>
