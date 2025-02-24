<template>
  <div class="row col-12 q-pa-md">
    <Title :title="'ProductsList'" />
  </div>

  <div class="row col-12">
    <div
      class="col-md-3 col-sm-12 col-lx-2 col-xs-12 col-6 q-pa-md"
      v-for="product in products"
      :key="product.product.id"
    >
      <router-link
        exact
        v-bind:to="{
          name: 'ProductDetails',
          params: { id: product.product.id },
        }"
      >
        <div
          class="q-card q-hoverable product-card"
          @mouseenter="hoveredProduct = product.product.id"
          @mouseleave="hoveredProduct = null"
        >
        <q-img :src="'https://i.imgur.com/XxKkypA.png'" class="product-image">
          <div v-if="hoveredProduct === product.product.id" class="icon-container">
            <q-btn flat round icon="favorite" class="icon-box" />
            <q-btn flat round icon="shopping_cart" class="icon-box" />
            <q-btn flat round icon="share" class="icon-box" />
            <q-btn flat round icon="info" class="icon-box" />
          </div>
       </q-img>

          <div class="badge sale">ON SALE</div>

          <div class="q-pa-sm text-center">
            <div class="row q-pa-md col-12">
              <div class="row col-8 text-left column">
                <div class="text-subtitle1 text-weight-bolder">
                  <q-rating
                    :model-value="4"
                    :max="5"
                    size="16px"
                    color="amber"
                    color-inactive="grey"
                    readonly
                  />
                </div>
                <div class="text-subtitle1 text-weight-bolder">
                  {{ product.product.product }}
                </div>
              </div>
              <div class="col-4 text-right column">
                <div class="text-grey-6 text-subtitle1">$ 56.21</div>
                <div class="text-subtitle1 text-h6 text-blue-8">$ 24.05</div>
              </div>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import Title from "../title/Title";
import { mapActions } from "vuex";

export default {
  name: "ProductList",
  components: { Title },

  data() {
    return {
      hoveredProduct: null,
      products: [],
    };
  },

  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
  },

  created() {
    this.getProducs(this.filters)
      .then((response) => {
        this.products = response.map((item) => ({
          ...item,
          product: {
            ...item.product,
            rating: item.product.rating || 0,
          },
        }));
      })
      .catch((error) => {
        console.error("Erro ao carregar produtos:", error);
      });
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
  padding: 15px 15px 15px 15px;
}

.product-image {
  width: 100%;
  height: auto;
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

.icon-container {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  width: 80%;
  background: transparent;
}

.icon-box {
  width: 15%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #ffffff;
}

.q-btn {
  
  color: linear-gradient(to right, #76b4fa, #2961ac);
  border-radius: 5px;
}
</style>
