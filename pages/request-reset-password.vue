<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center">
        <h1 class="display-1">Request Password Reset</h1>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title>Request Password Reset</v-card-title>
          <v-alert v-if="successMessage" type="info">{{ successMessage }}</v-alert>
          <v-alert v-if="errorMessage" type="info">{{ errorMessage }}</v-alert>
          <v-card-text>
            <v-form ref="form">
              <v-text-field label="Email"
                            type="email"
                            v-model="email"
                            :rules="[required, validEmail]"
              ></v-text-field>
              <v-btn color="primary" block @click="submitForm">Request Reset Email</v-btn>
            </v-form>
          </v-card-text>
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
      errorMessage: null,
      successMessage: null,
      required: (value) => !!value || 'This field is required',
      validEmail: (value) => {
        const emailPattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        return emailPattern.test(value) || 'E-mail must be valid';
      },
    };
  },
  methods: {
    async submitForm() {
      if (this.$refs.form.validate()) {
        await this.requestResetPassword();
      }
    },
    async requestResetPassword() {
      try {
        const requestData = new FormData();
        requestData.append('email', this.email);
        requestData.append('resetUrl', `${window.location.origin}/reset-password`);
        const response = await this.$axios.post('/api/auth/reset-password', requestData);

        if (response.status === 200) {
          this.successMessage = 'Password reset email sent successfully';
          this.errorMessage = '';
        }
      } catch (error) {
        console.error('Error sending password reset email:', error);
        this.errorMessage = "Password reset email was not transmitted.";
        this.successMessage = '';
      }
    },
  },
};
</script>
