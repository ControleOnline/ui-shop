<template>
  <div class="q-pa-md row">
    <div v-for="product in products" class="col-md-3 col-sm-4 col-6 q-pa-sm">
      <router-link
        exact
        v-bind:to="{
          name: 'ProductDetails',
          params: { id: product.product.id },
        }"
      >
        <q-card v-ripple class="cursor-pointer">
          <img src="https://cdn.quasar.dev/img/mountains.jpg" />

          <q-card-section>
            <div class="text-h6">{{ product.product.product }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            {{ product.product.description }}
          </q-card-section>
        </q-card>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "PageCategories",

  components: {},

  data() {
    return {
      products: [],
      categoryId: null,
    };
  },
  created() {
    this.categoryId = decodeURIComponent(this.$route.params.id);

    this.categorias();
  },
  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
  },
  methods: {
    ...mapActions({
      getProducs: "product_category/getItems",
    }),

    categorias() {
      let payload = {
        category: '/categories/'+this.categoryId,
      };

      this.getProducs(payload)
        .then((response) => {
          this.products = response;
        })
        .catch((error) => {});
    },
  },
};
</script>

<style></style>
