<template>
  <div class="q-pa-md row">
    <Categories />
  </div>
  <div class="q-pa-md row">
    <Categories />
  </div>
  <div class="q-pa-md row">
    <Categories />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Categories from "./Categories";

export default {
  name: "PageCategories",

  components: { Categories },

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
      myCompany: "people/currentCompany",
    }),
  },
  methods: {
    ...mapActions({
      getCategories: "categories/getItems",
    }),

    categorias() {
      this.getCategories({
        context: "products",
        //company: this.myCompany.id,
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
