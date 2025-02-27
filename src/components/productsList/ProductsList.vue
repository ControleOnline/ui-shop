<template>
  <div class="row col-12 q-pa-none">
    <Title :title="'ProductsList'" />
  </div>

  <div class="row col-12 justify-between q-pa-sm q-pl-lg q-pt-lg">
    <div
      class="q-hoverable product-card q-card col-6 col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 q-card q-gutter-md q-mt-md"
      v-for="product in products"
      :key="product.id"
      @mouseenter="hoveredProduct = product.id"
      @mouseleave="hoveredProduct = null"
    >
      <router-link
        exact
        v-bind:to="{
          name: 'ProductDetails',
          params: { id: product.id },
        }"
      >
        <DefaultCarousel
          v-if="product.productFiles"
          :object="{ product: product['@id'] }"
          :configs="carouselConfigs"
          :files="product.productFiles"
        />
      </router-link>
      <div class="badge sale btn-primary">ON SALE</div>

      <div class="q-pa-sm text-center">
        <div class="row q-pa-sm col-12">
          <div
            class="icon-container row col-12"
            v-if="1 == 1 || hoveredProduct === product.id"
          >
            <q-btn
              flat
              round
              icon="favorite"
              class="icon-box"
              @click="click('vovkrir')"
            />
            <q-btn flat round icon="shopping_cart" class="icon-box" />
            <q-btn flat round icon="share" class="icon-box" />
            <q-btn
              flat
              round
              icon="info"
              class="icon-box"
              @click="showDetails(product.id)"
            />
          </div>
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
              {{ product.product }}
            </div>
          </div>
          <div class="col-4 text-right column">
            <div class="text-grey-6 text-subtitle1">
              {{
                "R$ " + $formatter.formatMoney(product.price, "BRL", "pt-br")
              }}
            </div>
            <div class="text-subtitle1 text-h6 text-blue-8">$ 24.05</div>
          </div>
        </div>
      </div>
    </div>
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
import DefaultCarousel from "@controleonline/ui-default/src/components/Default/Common/DefaultCarousel.vue";
import ProductDetails from "../products/Details.vue";
export default {
  name: "ProductList",
  components: { Title, DefaultCarousel, ProductDetails },

  data() {
    return {
      hoveredProduct: null,
      products: [],
      openModal: false,
      productId: null,
    };
  },

  props: {
    filters: {
      type: Object,
      default: () => ({}),
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
    click(oque, $event) {
      $event.stopPropagation();
      console.log(oque);
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
  border: 1px solid #5f5f5f;
  background-color: #ffffff;
  color: #2f82cf;
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
