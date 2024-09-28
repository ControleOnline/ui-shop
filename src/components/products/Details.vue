<template>
  <div class="q-pa-md row">
    <div class="col-md-7 col-sm-12 q-pa-sm">
      <div class="details-image">
        <img src="https://cdn.quasar.dev/img/mountains.jpg" />
      </div>
    </div>

    <div class="col-md-5 col-sm-12 q-pa-sm">
      <div class="details-title">
        <h1>{{ productDetails.productName }}</h1>
      </div>

      <div class="price-container">
        <h2>R$ 250,00</h2>
      </div>

      <div class="details-resume">
        {{ productDetails.productResume }}
      </div>

      <div class="product-quantity">
        <q-input dense outlined type="number" />
        <q-btn class="full-width q-pa-xs btn-primary" label="Comprar" />
      </div>
    </div>

    <div class="col-md-12">
      <h4>Descrição do produto</h4>
      {{ productDetails.productDescription }}
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "ProductDetails",

  components: {},

  created() {
    this.categorias();
  },

  methods: {
    ...mapActions({
      getProductDetails: "shop/getProductDetails",
    }),

    categorias() {
      let payload = {
        id: 2,
      };

      this.getProductDetails(payload)
        .then((response) => {
          this.productDetails = response;
        })
        .catch((error) => {});
    },
  },

  data() {
    return {
      productDetails: [],
    };
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
