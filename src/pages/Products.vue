<template>
  <div class="q-pa-md row">
    <div class="col-md-3 col-sm-4 col-6 q-pa-sm">
      <router-link
        exact
        v-bind:to="'/shop/category/' + productDetails.id + '/product/details'"
      >
        <q-card v-ripple class="cursor-pointer">
          <img src="https://cdn.quasar.dev/img/mountains.jpg" />

          <q-card-section>
            <div class="text-h6">{{ productDetails.productName }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            {{ productDetails.productDescription }}
          </q-card-section>
        </q-card>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "PageCategories",

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
        .catch((error) => {
        });
    },
  },

  data() {
    return {
      productDetails: [],
    };
  },
};
</script>

<style></style>
