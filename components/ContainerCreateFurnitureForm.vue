<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <v-card>
          <v-card-title>
            Add New Furniture Product
          </v-card-title>
          <v-card-text>
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
              <v-text-field
                v-model="product.price"
                :rules="requiredFieldRule"
                label="Price"
                required
                type="number"
              ></v-text-field>
              <v-file-input
                v-model="product.model"
                :rules="[modelFileRule]"
                label="3D Model (OBJ or GLTF/GLB)"
                accept=".gltf,.glb,.obj"
                @change="onModelFileChange"
                required
              ></v-file-input>
              <v-file-input
                v-if="showMtlField"
                v-model="product.mtl"
                :rules="[mtlFormatRule]"
                label="MTL File (Optional)"
                accept=".mtl"
              ></v-file-input>
              <v-file-input
                v-if="showBinField"
                v-model="product.bin"
                :rules="[binFormatRule]"
                label="BIN File"
                accept=".bin"
              ></v-file-input>
              <v-file-input
                v-if="showTexturesField"
                v-model="product.textures"
                :rules="[texturesFormatRule]"
                label="Textures (Optional)"
                accept="image/png,image/jpeg"
                multiple
              ></v-file-input>
              <v-btn type="submit" color="primary" :loading="submitting">
                Submit
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
  data() {
    return {
      product: {
        name: "",
        description: "",
        model: null,
        mtl: null,
        bin: null,
        textures: [],
        price: null,
      },
      requiredFieldRule: [(v) => !!v || "This field is required"],
      modelFileRule: (value) => {
        if (!value) {
          return "This field is required";
        }

        const allowedFormats = [".obj", ".gltf", ".glb"];
        const fileFormat = "." + value.name.split(".").pop().toLowerCase();
        return allowedFormats.includes(fileFormat)
          ? true
          : "Invalid file format. Only OBJ and (glTF/glb) files are allowed.";
      },
      mtlFormatRule: (value) => {
        if (!value) {
          return true;
        }
        const allowedFormats = [".mtl"];
        const fileFormat = "." + value.name.split(".").pop().toLowerCase();
        return allowedFormats.includes(fileFormat)
          ? true
          : "Invalid file format. Only MTL files are allowed.";
      },
      binFormatRule: (value) => {
        if (!value) {
          return "This field is required";
        }
        const allowedFormats = [".bin"];
        const fileFormat = "." + value.name.split(".").pop().toLowerCase();
        return allowedFormats.includes(fileFormat)
          ? true
          : "Invalid file format. Only BIN files are allowed.";
      },
      texturesFormatRule: (value) => {
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
    isGltfFormat() {
      return this.product.model && this.product.model.name.endsWith(".gltf");
    },
    showMtlField() {
      return this.isObjFormat;
    },
    showBinField() {
      return this.isGltfFormat;
    },
    showTexturesField() {
      return this.isObjFormat || this.isGltfFormat;
    },
  },
  methods: {
    async submitForm() {
      if (this.$refs.productForm.validate()) {
        this.submitting = true;
        const formData = new FormData();
        formData.append("name", this.product.name);
        formData.append("description", this.product.description);
        formData.append("price", this.product.price);
        formData.append("model", this.product.model);
        if (this.isObjFormat && this.product.mtl) {
          formData.append("mtl", this.product.mtl);
        }
        if (this.isGltfFormat && this.product.bin) {
          formData.append("bin", this.product.bin);
        }
        this.product.textures.forEach((texture) => {
          formData.append("textures", texture);
        });

        try {
          await this.$axios.post("/api/furniture/add", formData);
          this.$refs.productForm.reset();
          this.$emit("productAdded");
        } catch (error) {
          console.error("Failed to submit product form:", error);
          console.error("Error response:", error.response);
          console.log("Error data:", error.response.data);
        } finally {
          this.submitting = false;
        }
      }
    },
    onModelFileChange() {
      if (this.isObjFormat) {
        this.product.bin = null;
      } else if (this.isGltfFormat) {
        this.product.mtl = null;
      }
    },
  },
};
</script>
