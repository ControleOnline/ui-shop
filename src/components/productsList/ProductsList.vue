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
import { mapActions } from "vuex";
import ProductDetails from "../products/Details.vue";

import productCard from "@controleonline/ui-orders/src/components/cart/productCard";
export default {
  components: { Title, ProductDetails, productCard },

  data() {
    return {
      products: [],
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
  computed: {},
  created() {
    this.getProducs(this.filters)
      .then((response) => {
        this.products = response;
      })
      .catch((error) => {
        console.error("Erro ao carregar produtos:", error);
      });
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
    showDetails(productId) {
      this.productId = productId;
      this.openModal = true;
    },
  },
};
</script>

<style>
.badge.sale {
  position: absolute;
  top: 16px;
  right: 16px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  padding: 4px 8px;
}

.icon-container {
  /*position: absolute;*/
  bottom: 15px;
  left: 50%;

  display: flex;
  justify-content: space-between;
  background: transparent;
}

.icon-box {
  width: 20%;
  height: 55px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--primary);
  background-color: #ffffff;
  color: var(--primary);
}

.q-btn {
  border-radius: 5px;
}

.text-subtitle1 {
  font-size: 14px;
  color: #000000;
  font-weight: 600;
  text-decoration: none;
}

.text-subtitle1 a {
  font-size: 14px;
  color: #000000;
  font-weight: 600;
  text-decoration: none;
}

.product-card {
  transition: box-shadow 0.3s ease;
}
.product-card:hover,
.icon-box:hover {
  box-shadow: 0 4px 8px rgb(0 0 0 / 53%);
}
.icon-box:hover {
  background-color: var(--primary) !important;
  color: var(--text-primary) !important;
}
</style>
