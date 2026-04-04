<template>
  <div class="q-pa-sm row">
    <Details />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Details from "../components/products/Details";

export default {
  name: "PageCategories",

  components: { Details },

  data() {
    return {
    };
  },
  created() {},

  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
  },
  methods: {
    ...mapActions({}),
  },
};
</script>

