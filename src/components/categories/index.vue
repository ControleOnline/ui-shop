<template>
  <div class="row col-12 justify-between q-pa-sm q-pl-lg q-pt-lg">
    <div
      class="q-hoverable product-card q-card col-6 col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 q-card q-gutter-md q-mt-md"
      v-for="category in categorys"
      :key="category.id"
    >
      <router-link
        exact
        v-bind:to="{ name: 'ProductsInCategory', params: { id: category.id } }"
      >
        <q-card v-ripple class="cursor-pointer">
          <DefaultCarousel
            :object="{ category: category['@id'] }"
            :configs="carouselConfigs"
            :files="category.categoryFiles"
          />
          <q-card-section>
            <div class="text-h6">{{ category.name }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            {{ category["@type"] }}
          </q-card-section>
        </q-card>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  components: {},

  data() {
    return {
      categorys: [],
    };
  },
  props: {
    filters: {
      type: Object,
      default: () => ({
        itemsPerPage: 16,
        exists: { categoryFiles: "true" },
        categoryFiles: { file: { fileType: "image" } },
        order: { name: "ASC" },
        context: "products",
      }),
    },
  },
  created() {
    this.getCaterories(this.filters).then((data) => {
      this.categorys = data;
    });
  },

  computed: {
    ...mapGetters({}),

    carouselConfigs() {
      return {
        store: "category_file",
        isAdmin: false,
        context: "categoryFiles",
        zoom: false,
        navigation: true,
      };
    },
  },
  methods: {
    ...mapActions({
      getCaterories: "categories/getItems",
    }),
  },
};
</script>
