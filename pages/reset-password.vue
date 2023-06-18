<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title>
            Reset Password
          </v-card-title>
          <v-card-text>
            <v-form ref="form" @submit.prevent="changePassword">
              <v-text-field
                v-model="password"
                label="New Password"
                type="password"
                required
                :rules="[rules.required, rules.minLength]"
              ></v-text-field>
              <v-text-field
                v-model="confirmPassword"
                label="Confirm New Password"
                type="password"
                required
                :rules="[rules.required, rules.matchPassword]"
              ></v-text-field>
              <v-snackbar
                v-if="status !== null"
                v-model="snackbar"
                :color="status.color"
                :timeout="status.timeout"
              >
                {{ status.message }}
              </v-snackbar>
              <v-snackbar
                v-if="invalidToken"
                v-model="invalidTokenSnackbar"
                color="red"
                timeout="5000"
              >
                Invalid token
              </v-snackbar>
              <v-btn
                type="submit"
                color="primary"
                :disabled="!valid || invalidToken"
              >
                Change Password
              </v-btn>
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
      password: "",
      confirmPassword: "",
      valid: false,
      status: null,
      snackbar: false,
      invalidToken: false,
      invalidTokenSnackbar: false,
      rules: {
        required: value => !!value || "This field is required.",
        minLength: value =>
          value.length >= 8 || "Password must be at least 8 characters long.",
        matchPassword: value =>
          value === this.password || "Passwords must match."
      }
    };
  },
  async asyncData({ query }) {
    return {
      token: query.token
    };
  },
  mounted() {
    this.validateToken();
  },
  methods: {
    async validateToken() {
      try {
        const formdata = new FormData();
        formdata.append("token", this.token);
        await this.$axios.post("/api/auth/validate-token", formdata);
      } catch (error) {
        this.invalidToken = true;
        this.invalidTokenSnackbar = true;
        return;
      }
      this.invalidToken = false;
    },
    async changePassword() {
      this.$refs.form.validate();
      if (!this.valid || this.invalidToken) return;
      try {
        let formdata = new FormData();
        formdata.append("token", this.token);
        formdata.append("newPassword", this.password);
        // Call the API to change the password using the token and new password.
        await this.$axios.post("api/auth/change-password", formdata);
        this.status = {
          message: "Password changed successfully",
          color: "green",
          timeout: 5000
        };
      } catch (error) {
        this.status = {
          message: error.response.data || "Error changing password",
          color: "red",
          timeout: 5000
        };
      }
      this.snackbar = true;
    }
  },
  watch: {
    password() {
      this.valid = this.$refs.form.validate();
    },
    confirmPassword() {
      this.valid = this.$refs.form.validate();
    }
  }
};
</script>
