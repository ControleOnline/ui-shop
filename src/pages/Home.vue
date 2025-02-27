<template>
  <div class="q-pa-none row">
    <Banners />
  </div>
  <div class="q-pa-none row">
    <Destaques
      :filters="{
        itemsPerPage: 3,
        exists: { productFiles: 'true' },

        productFiles: { file: { fileType: 'image' } },
      }"
    />
  </div>
  <div class="q-pa-none row">
    <ProductsList
      :filters="{
        itemsPerPage: 16,
        exists: { productFiles: 'true' },
        productFiles: { file: { fileType: 'image' } },
      }"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Categories from "./Categories";
import Banners from "../components/banners/Banners";
import Destaques from "../components/destaques/Destaques";
import ProductsList from "../components/productsList/ProductsList";

export default {
  name: "PageCategories",

  components: { Categories, Banners, Destaques, ProductsList },

  data() {
    return {
      categories: [],
    };
  },
  created() {},

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
