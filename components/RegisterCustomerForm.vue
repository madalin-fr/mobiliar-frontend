<template>
  <v-form ref="form" lazy-validation>
    <v-text-field
      label="Full Name"
      v-model="formData.name"
      :rules="nameRules"
      required
    ></v-text-field>
    <v-text-field
      label="Email"
      v-model="formData.email"
      :rules="emailRules"
      required
    ></v-text-field>
    <v-alert v-if="emailUsed" type="error" dense>
      Email already used
    </v-alert>
    <v-text-field
      label="Password"
      v-model="formData.password"
      :rules="passwordRules"
      required
      type="password"
    ></v-text-field>
    <v-text-field
      label="Confirm Password"
      v-model="formData.confirmPassword"
      :rules="confirmPasswordRules"
      required
      type="password"
    ></v-text-field>
    <v-text-field
      label="Address Line 1"
      v-model="formData.address1"
      :rules="address1Rules"
      required
    ></v-text-field>
    <v-text-field
      label="Address Line 2"
      v-model="formData.address2"
    ></v-text-field>
    <client-only>
      <MazPhoneNumberInput
        v-model="formData.phoneNumber"
        default-country-code="RO"
        :dark="getDarkMode"
        :preferred-countries="['RO', 'DE', 'FR', 'IT', 'ES', 'GB', 'US', 'CA', 'AU', 'NZ']"
        @update="phoneResults = $event"
      />
    </client-only>
    <v-alert v-if="phoneUsed" type="error" dense>
      Phone number already used
    </v-alert>
    <v-checkbox
      label="I agree to the terms and conditions"
      v-model="formData.termsAccepted"
      :rules="termsRules"
      required
    ></v-checkbox>
    <v-card-actions>
      <v-btn :disabled="!isFormValid" color="primary" @click="validateAndRegister">Register</v-btn>
    </v-card-actions>
    <v-alert v-if="showSuccess" type="success" dense>
      User registered successfully. Please check your e-mail to confirm your account.
    </v-alert>
  </v-form>
</template>
<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    showSuccess: {
      type: Boolean,
      default: false,
    },
    getDarkMode: {
      type: Boolean,
      default: false,
    },
    accountExists: {
      type: Object,
      default: () => ({
        email: false,
        phone: false,
      }),
    },
  },
  computed: {
    isFormValid() {
      return     this.formData.name &&
        this.formData.email &&
        this.formData.password &&
        this.formData.confirmPassword &&
        this.formData.password === this.formData.confirmPassword &&
        this.formData.address1 &&
        this.phoneResults &&
        this.phoneResults.isValid &&
        this.formData.termsAccepted
    }
  },
  data() {
    return {
        formData: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false,
        address1: '',
        address2: '',
        phoneNumber: null,
      },
      nameRules: [(v) => !!v || 'Name is required'],
      emailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      passwordRules: [(v) => !!v || 'Password is required'],
      confirmPasswordRules: [
        (v) => !!v || 'Confirm Password is required',
        (v) => v === this.formData.password || "Passwords don't match",
      ],
      termsRules: [(v) => !!v || 'You must agree to the terms and conditions'],
      address1Rules: [(v) => !!v || 'Address Line 1 is required'],
      phoneResults: null,
      emailUsed: false,
      phoneUsed: false,
    };
  },
  watch: {
    'accountExists.email': {
      handler(newVal) {
        // When email account exists status changes, update the emailUsed value
        this.emailUsed = newVal;
      },
    },
    'accountExists.phone': {
      handler(newVal) {
        // When phone account exists status changes, update the phoneUsed value
        this.phoneUsed = newVal;
      },
    },
  },
  methods: {
    validateAndRegister() {
      if (this.phoneResults && !this.phoneResults.isValid) {
        this.showPhoneError = true; // only show error message when submitting register form
      }
      if (this.$refs.form.validate()) {
        this.$emit('register', this.formData);
      }
    },
    setEmailUsed(value) {
      this.emailUsed = value;
    },
    setPhoneUsed(value) {
      this.phoneUsed = value;
    },
  },
};
</script>
