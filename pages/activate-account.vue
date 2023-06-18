<template>
  <div>
    <h1>Account Activation</h1>
    <p v-if="activationStatus === 'pending'">Activating your account...</p>
    <p v-if="activationStatus === 'success'">Your account has been successfully activated.</p>
    <p v-if="activationStatus === 'error'">There was an error activating your account. Please try again later or contact support.</p>
    <p v-if="activationStatus !== 'pending'">Redirecting in {{ countdown }} seconds...</p>
  </div>
</template>

<script>
export default {
  auth: 'guest',
  data() {
    return {
      activationStatus: 'pending',
      countdown: 15,
    };
  },
  async mounted() {
    const token = this.$route.query.token;
    try {
      await this.activateAccount(token);
      this.activationStatus = 'success';
    } catch (error) {
      this.activationStatus = 'error';
    } finally {
      const interval = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          clearInterval(interval);
          this.$router.push({ path: '/', query: { activationStatus: this.activationStatus } });
        }
      }, 1000); // 1 second interval
    }
  },
  methods: {
    async activateAccount(token) {
      try {
        let activateToken = new FormData();
        activateToken.append("token"  , token);
        await this.$axios.post("/api/auth/activate-account", activateToken);
      } catch (error) {
        if (error.response) {
          // The request was made, and the server responded with a non-200 status
          // Use the status code and error message from the response directly
          throw new Error(`[${error.response.status}] ${error.response.data}`);
        } else {
          // Fallback error message when there's no response from the server
          throw new Error('Account activation failed');
        }
      }
    },
  },
};
</script>
