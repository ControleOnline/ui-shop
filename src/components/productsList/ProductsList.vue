<template>
  <Title :title="'ProductsList'" />
  <div class="row col-12">
    <div class="col-md-3 col-sm-4 col-6 q-pa-sm" v-for="product in products">
      <router-link
        exact
        v-bind:to="{
          name: 'ProductDetails',
          params: { id: product.product.id },
        }"
      >
        <div class="q-card q-hoverable product-card">
          <q-img
            src="https://cdn.quasar.dev/img/parallax2.jpg"
            class="product-image"
          />
          <div class="badge sale">ON SALE</div>
          <div class="q-pa-sm text-center">
            <q-rating
              v-model="rating"
              :max="5"
              size="16px"
              color="amber"
              readonly
            />
            <div class="text-subtitle1 text-weight-bolder">
              {{ product.product.product }}
            </div>
            <div class="text-subtitle1 text-weight-bolder">
              {{ product.product.description }}
            </div>
            <div class="text-grey-6 text-strike q-mt-xs">$ 56.21</div>
            <div class="text-h6 text-blue-8 q-mt-xs">$ 24.05</div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import Title from "../title/Title";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "ProductList",

  components: { Title },
  data() {
    return {
      rating: 4,
      products: [],
    };
  },

  props: {
    filters: {
      default: {},
    },
  },
  created() {
    this.getProducs(this.filters)
      .then((response) => {
        this.products = response;
      })
      .catch((error) => {});
  },
  methods: {
    ...mapActions({
      getProducs: "product_category/getItems",
    }),
  },
};
</script>

<style scoped>
.product-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background-color: #fff;
}

.product-image {
  height: 250px;
  object-fit: cover;
  border-bottom: 1px solid #e0e0e0;
}

.badge.sale {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: #1976d2;
  color: #fff;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  padding: 4px 8px;
}
</style>
