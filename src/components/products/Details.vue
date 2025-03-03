<template>
  <div class="row q-pa-sm full-width">
    <div class="row col-md-6 col-sm-12 q-pa-sm left-bar">
      <div class="row col-12 carousel-container">
        <DefaultCarousel
          v-if="productDetails.productFiles"
          :object="{ product: productDetails['@id'] }"
          :configs="carouselConfigs"
          :files="productDetails.productFiles"
        />
      </div>
      <div class="row col-12 description-container">
        <h4>Descrição do produto</h4>
        {{ productDetails.description }}
      </div>
    </div>

    <div class="row col-md-6 col-sm-12 q-pa-sm right-bar">
      <div class="row col-12 details-title">
        <h1>{{ productDetails.product }}</h1>
      </div>

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

        <ProductQuantity
          v-else
          :product="productDetails"
          @increaseQuantity="increaseQuantity"
          @decreaseQuantity="decreaseQuantity"
        />
      </div>

      <div class="row col-12 product-add">
        <q-btn class="full-width q-pa-xs btn-primary" label="Comprar" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import DefaultCarousel from "@controleonline/ui-default/src/components/Default/Common/DefaultCarousel.vue";
import CustomProduct from "@controleonline/ui-orders/src/components/CustomProduct.vue";
import ProductQuantity from "@controleonline/ui-orders/src/components/ProductQuantity.vue";

export default {
  name: "ProductDetails",

  components: { DefaultCarousel, CustomProduct, ProductQuantity },
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
