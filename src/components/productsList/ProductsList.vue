<template>
  <div class="row col-12 q-pa-none">
    <Title :title="'ProductsList'" />
  </div>

  <div class="row col-12 justify-between q-pa-sm q-pl-lg q-pt-lg">
    <template
      v-for="product in products"
      :key="product.id"
      @click="clickProduct(product)"
    >
      <productCard :product="product" @showDetails="showDetails" />
    </template>
  </div>

  <q-dialog v-model="openModal" full-width full-height>
    <q-card class="">
      <q-card-section
        class="row col-12 q-pa-sm fixed bg-primary sticky-top full-width"
        style="z-index: 999999"
      >
        Header
      </q-card-section>
      <q-card-section class="row q-pa-md">
        <ProductDetails :productId="productId"
      /></q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import Title from "../title/Title";
import { mapActions, mapGetters } from "vuex";
import ProductDetails from "../products/Details.vue";

import productCard from "@controleonline/ui-orders/src/components/cart/productCard";
export default {
  components: { Title, ProductDetails, productCard },

  data() {
    return {
      openModal: false,
      productId: null,
    };
  },

  props: {
    filters: {
      type: Object,
      default: () => ({
        itemsPerPage: 16,
        exists: { productFiles: "true" },
        productFiles: { file: { fileType: "image" } },
        random: "true",
      }),
    },
  },
  computed: {
    ...mapGetters({
      products: "products/items",
    }),
  },
  created() {
    this.getProducs(this.filters);
  },

  methods: {
    ...mapActions({
      getProducs: "products/getItems",
    }),
    clickProduct(product) {
      this.$route.push({
        name: "ShopProductDetails",
        params: { id: product.id },
      });
    },
    showDetails(product) {
      this.productId = product.id;
      this.openModal = true;
    },
  },
};
</script>
