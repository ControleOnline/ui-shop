<template>
  <div class="q-pa-sm row">
    <ProductList :filters="filters" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ProductList from "../components/productsList/ProductsList.vue";
export default {
  name: "PageCategories",
  components: { ProductList },
  data() {
    return {
      products: [],
      categoryId: null,
    };
  },
  created() {
    this.categoryId = decodeURIComponent(this.$route.params.id);
  },
  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
    filters() {
      return {
        productCategory: { category: "/categories/" + this.categoryId },
        exists: { productFiles: "true" },
        productFiles: {
          file: { fileType: "image" },
        },
      };
    },
  },
  methods: {},
};
</script>
