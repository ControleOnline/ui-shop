<template>
  <div class="q-pa-md row">
    <div
      class="col-md-3 col-sm-4 col-6 q-pa-sm"
      v-for="categorie in categories"
      :key="categorie.id"
    >
      <router-link exact v-bind:to="'/shop/category/' + categorie.id">
        <q-card v-ripple class="cursor-pointer">
          <img src="https://cdn.quasar.dev/img/mountains.jpg" />

          <q-card-section>
            <div class="text-h6">{{ categorie["@type"] }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            {{ categorie["@type"] }}
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
      getCategories: "shop/getProductCategories",
    }),

    categorias() {
      this.getCategories()
        .then((response) => {
          this.categories = response;
        })
        .catch((error) => {});
    },
  },

  data() {
    return {
      categories: [],
    };
  },
};
</script>

<style lang="sass" scoped></style>
