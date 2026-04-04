<template>
  <Categories />
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Categories from "../components/categories";

export default {
  components: { Categories },

  data() {
    return {
      categories: [],
    };
  },
  created() {},

  computed: {
    ...mapGetters({}),
  },
  methods: {
    ...mapActions({}),
  },
};
</script>

<style lang="sass" scoped></style>
