<template>
  <div class="row">
    <ProductsList
      :filters="{
        itemsPerPage: 32,
        exists: { productFiles: 'true' },
        productFiles: { file: { fileType: 'image' } },
        order: { product: 'ASC' },
        product: query,
      }"
    />

    <Categories
      :filters="{
        itemsPerPage: 32,
        exists: { categoryFiles: 'true' },
        categoryFiles: { file: { fileType: 'image' } },
        order: { name: 'ASC' },
        context: 'products',
        name: query,
      }"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ProductsList from "../components/productsList/ProductsList";
import Categories from "../components/categories";

export default {
  components: { ProductsList, Categories },

  data() {
    return {
      query: "",
    };
  },
  created() {
    this.query = decodeURIComponent(this.$route.params.q);
  },

  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
  },
  methods: {
    ...mapActions({}),
  },
};
</script>

<style lang="sass" scoped></style>
