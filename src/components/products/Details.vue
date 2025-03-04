<template>
  <div class="row q-pa-sm full-width">
    <div class="row col-12 col-md-6 col-sm-12 q-pa-sm left-bar">
      <q-btn
        flat
        icon="arrow_back"
        color="primary"
        @click="$router.back()"
        label="Voltar"
        class="q-mb-md"
      />
    </div>
    <div class="row col-md-6 col-sm-12 q-pa-sm right-bar">
      <div class="row col-12 details-title">
        <h1>{{ productDetails.product }}</h1>
      </div>
    </div>
  </div>
  <div class="row q-pa-sm full-width">
    <div class="row col-12 col-md-6 col-sm-12 q-pa-sm left-bar">
      <div class="row col-12 carousel-container">
        <DefaultCarousel
          v-if="productDetails.productFiles"
          :object="{ product: productDetails['@id'] }"
          :configs="carouselConfigs"
          :files="productDetails.productFiles"
        />
      </div>
      <div class="row col-12 description-container">
        {{ productDetails.description }}
      </div>
    </div>

    <div class="row col-md-6 col-sm-12 q-pa-sm right-bar">
      <div class="row col-12 price-container">
        <h2>{{ "R$ " + $formatter.formatMoney(productDetails.price) }}</h2>
      </div>

      <div class="row col-12 details-resume">
        {{ productDetails.description }}
      </div>
      <div class="row col-12 details-resume">
        <CustomProduct
          v-if="productDetails.type === 'custom'"
          :selectedProduct="productDetails"
          @changeSelection="changeSelection"
          @changeIngredients="changeIngredients"
        />
      </div>
    </div>
  </div>

  <div class="row full-width sticky-bottom bg-white q-pa-md">
    <addProduct :product="productDetails"/>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import DefaultCarousel from "@controleonline/ui-default/src/components/Default/Common/DefaultCarousel.vue";
import CustomProduct from "@controleonline/ui-orders/src/components/CustomProduct.vue";
import addProduct from "@controleonline/ui-orders/src/components/cart/addProduct";
export default {
  name: "ProductDetails",

  components: {
    addProduct,
    DefaultCarousel,
    CustomProduct,
    
  },
  props: {
    productId: {
      required: false,
    },
  },
  computed: {
    carouselConfigs() {
      return {
        store: "product_file",
        isAdmin: false,
      };
    },
  },
  data() {
    return {
      productDetails: [],
      id: null,
    };
  },
  created() {
    this.id = this.productId || decodeURIComponent(this.$route.params.id);
    this.categorias();
  },

  methods: {
    ...mapActions({
      getProductDetails: "products/get",
    }),

    categorias() {
      this.getProductDetails(this.id)
        .then((response) => {
          this.productDetails = response;
        })
        .catch((error) => {});
    },
  },
};
</script>

<style>
.carousel-container,
.q-carousel {
  min-height: 80vh !important;
}
.carousel-container,
.left-bar,
.right-bar {
  height: fit-content !important; /* Faz o container se ajustar ao conteúdo */
  overflow: hidden; /* Garante que não haja conteúdo excedente */
}

.description-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.details-title h1 {
  font-size: 28px;
  font-weight: 700;
}

.price-container h2 {
  font-size: 28px;
  font-weight: 700;
  text-transform: uppercase;
}
</style>
