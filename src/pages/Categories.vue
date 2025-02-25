<template>
  <div class="row">
    <div
      class="col-md-3 col-sm-4 col-6 q-pa-sm"
      v-for="categorie in categories"
      :key="categorie.id"
    >
      <router-link
        exact
        v-bind:to="{ name: 'ProductsInCategory', params: { id: categorie.id } }"
      >
        <q-card v-ripple class="cursor-pointer">
          <img src="https://cdn.quasar.dev/img/mountains.jpg" />

          <q-card-section>
            <div class="text-h6">{{ categorie.name }}</div>
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
import { mapActions, mapGetters } from "vuex";

export default {
  name: "PageCategories",

  components: {},

  data() {
    return {
      categories: [],
    };
  },
  created() {
    this.categorias();
  },

  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
  },
  methods: {
    ...mapActions({
      getCategories: "categories/getItems",
    }),

    categorias() {
      this.getCategories({
        context: "products",
        company: this.defaultCompany.id,
      })
        .then((response) => {
          this.categories = response;
        })
        .catch((error) => {});
    },
  },
};
</script>

<style lang="sass" scoped></style>
