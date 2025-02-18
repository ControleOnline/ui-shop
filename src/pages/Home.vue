<template>
  <div class="q-pa-md row">
    <Banners />
  </div>  
  <div class="q-pa-md row">
    <Destaques />
  </div>  
  <div class="q-pa-md row">
    <ProductsList />    
  </div>  
  <div class="q-pa-md row">
    <Categories />    
  </div>
  <div class="q-pa-md row">
    <Categories />
  </div>
  <div class="q-pa-md row">
    <Categories />
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
  created() {
  
  },

  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
  },
  methods: {
    ...mapActions({
      
    }),
  },
};
</script>

<style lang="sass" scoped></style>
