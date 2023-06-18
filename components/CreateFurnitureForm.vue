<template>
  <div>
    <v-form ref="productForm" @submit.prevent="submitForm">
      <v-text-field
        v-model="product.name"
        :rules="requiredFieldRule"
        label="Product Name"
        required
      ></v-text-field>
      <v-textarea
        v-model="product.description"
        :rules="requiredFieldRule"
        label="Product Description"
        required
      ></v-textarea>
      <v-slider
        v-model="product.price"
        :rules="requiredFieldRule"
        label="Price"
        required
        thumb-label
        min="0"
        max="1000"
        step="25"
      ></v-slider>
      <v-file-input
        v-model="product.image"
        :rules="[imageFileRule]"
        label="Showcase Environment (Optional)"
        accept="image/png,image/jpeg"
      ></v-file-input>
      <v-file-input
        v-model="product.model"
        :rules="[modelFileRule]"
        label="3D Model (OBJ)"
        accept=".obj"
        required
      ></v-file-input>
      <v-file-input
        v-if="showMtlField"
        v-model="product.mtl"
        :rules="[mtlFileRule]"
        label="MTL File (Optional)"
        accept=".mtl"
      ></v-file-input>
      <v-file-input
        v-if="showTexturesField"
        v-model="product.textures"
        :rules="[imageFileRule]"
        label="Textures (Optional)"
        accept="image/png,image/jpeg"
        multiple
      ></v-file-input>
      <v-btn type="submit" color="primary" :loading="submitting">
        Submit
      </v-btn>
    </v-form>
    <v-snackbar
      v-model="snackbar.visible"
      :timeout="-1"
      :color="snackbar.color"
      :top="snackbar.top"
      :right="snackbar.right"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      product: {
        name: "",
        description: "",
        model: null,
        mtl: null,
        textures: [],
        price: 100,
      },
      snackbar: {
        visible: false,
        text: "",
        color: "info",
        timeout: 5000,
        top: true,
        right: true,
      },
      requiredFieldRule: [(v) => !!v || "This field is required"],
      modelFileRule: (value) => {
        if (!value) {
          return "This field is required";
        }
        const allowedFormats = [".obj"];
        const fileFormat = "." + value.name.split(".").pop().toLowerCase();
        return allowedFormats.includes(fileFormat)
          ? true
          : "Invalid file format. Only OBJ files are allowed.";
      },
      mtlFileRule: (value) => {
        if (!value) {
          return true;
        }
        const allowedFormats = [".mtl"];
        const fileFormat = "." + value.name.split(".").pop().toLowerCase();
        return allowedFormats.includes(fileFormat)
          ? true
          : "Invalid file format. Only MTL files are allowed.";
      },
      imageFileRule: (value) => {
        if (!value || value.length === 0) {
          return true;
        }
        const allowedFormats = [".png", ".jpg", ".jpeg"];
        for (let i = 0; i < value.length; i++) {
          const fileFormat = "." + value[i].name.split(".").pop().toLowerCase();
          if (!allowedFormats.includes(fileFormat)) {
            return "Invalid file format. Only PNG and JPG files are allowed.";
          }
        }
        return true;
      },
      submitting: false,

    };
  },
  computed: {
    isObjFormat() {
      return this.product.model && this.product.model.name.endsWith(".obj");
    },
    showMtlField() {
      return this.isObjFormat;
    },
    showTexturesField() {
      return this.isObjFormat;
    },
  },
  methods: {
    async submitForm() {
      if (this.$refs.productForm.validate()) {
        this.submitting = true;
        this.snackbar.text = "Please wait while your files are being uploaded...";
        this.snackbar.visible = true;

        const formData = new FormData();
        formData.append("name", this.product.name);
        formData.append("description", this.product.description);
        formData.append("price", this.product.price);
        if(this.product.image) {
          formData.append("image", this.product.image);
        }
        formData.append("model", this.product.model);
        if (this.isObjFormat && this.product.mtl) {
          formData.append("mtl", this.product.mtl);
        }
        this.product.textures.forEach((texture) => {
          formData.append("textures", texture);
        });
        formData.append("customerEmail", this.$auth.user.email);

        try {
          await this.$axios.post("/api/furniture/add", formData);
          this.snackbar.visible = false;
          this.$refs.productForm.reset();
        } catch (error) {
          this.snackbar.text = "An error occurred while submitting the form. Please try again.";
          this.snackbar.color = "error";
          this.snackbar.visible = true;
          setTimeout(() => {
            this.snackbar.visible = false;
          }, 5000);
        } finally {
          this.submitting = false;
          this.$router.push('/');
        }
      }
    },
  },
};
</script>
