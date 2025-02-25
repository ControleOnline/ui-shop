<template>
  <div class="q-pa-sm row">
    <div class="col-md-7 col-sm-12 q-pa-sm">
      <div class="details-image">
        <DefaultCarousel
          v-if="productDetails.productFiles"
          :object="{ product: productDetails['@id'] }"
          :configs="carouselConfigs"
          :files="productDetails.productFiles"
        />
      </div>
    </div>

    <div class="col-md-5 col-sm-12 q-pa-sm">
      <div class="details-title">
        <h1>{{ productDetails.product }}</h1>
      </div>

      <div class="price-container">
        <h2>{{ "R$ " + $formatter.formatMoney(productDetails.price) }}</h2>
      </div>

      <div class="details-resume">
        {{ productDetails.description }}
      </div>

      <div class="product-quantity">
        <q-input dense outlined type="number" />
        <q-btn class="full-width q-pa-xs btn-primary" label="Comprar" />
      </div>
    </div>

    <div class="col-md-12">
      <h4>Descrição do produto</h4>
      {{ productDetails.description }}
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import DefaultCarousel from "@controleonline/ui-default/src/components/Default/Common/DefaultCarousel.vue";

export default {
  name: "ProductDetails",

  components: { DefaultCarousel },

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
      productId: null,
    };
  },
  created() {
    this.productId = decodeURIComponent(this.$route.params.id);

    this.categorias();
  },

  methods: {
    ...mapActions({
      getProductDetails: "products/get",
    }),

    categorias() {
      this.getProductDetails(this.productId)
        .then((response) => {
          this.productDetails = response;
        })
        .catch((error) => {});
    },
  },
};
</script>

<style>
.details-title h1 {
  font-size: 28px;
  font-weight: 700;
}

.price-container h2 {
  font-size: 28px;
  font-weight: 700;
  text-transform: uppercase;
}

.details-image img {
  width: 100%;
}
</style>
