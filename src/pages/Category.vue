<template>
  <div
    class="row col-12 carousel-container"
    v-if="category?.categoryFiles?.length > 0"
  >
    <DefaultCarousel
      :object="{ category: category['@id'] }"
      :configs="carouselConfigs"
      :files="category.categoryFiles"
    />
  </div>
  <div class="q-pa-sm row">
    {{ category.name }}
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
      category: {},
      products: [],
      categoryId: null,
    };
  },
  created() {
    this.categoryId = decodeURIComponent(this.$route.params.id);
    this.getCategory(this.categoryId).then((data) => {
      this.category = data;
    });
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

    carouselConfigs() {
      return {
        store: "category_file",
        isAdmin: false,
        context: "categoryFiles",
        zoom: false,
        navigation: true,
      };
    },
  },
  methods: {
    ...mapActions({
      getCategory: "categories/get",
    }),
  },
};
</script>
