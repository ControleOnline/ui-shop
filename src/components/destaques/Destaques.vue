<template>
  <div class="row col-12" v-if="products.length > 0">
    <div
      class="col-4 q-pa-sm col-md-4 col-sm-12 col-xs-12"
      v-for="(product, index) in products"
      :key="index"
    >
      <router-link
        exact
        v-bind:to="{ name: 'ProductDetails', params: { id: product.id } }"
      >
        <div class="row items-center q-pa-sm" style="background-color: #d3ecf3">
          <!-- Imagem à esquerda (60% da largura, mas menor) -->
          <div class="col-6">
            <q-img
              :src="$image(product.productFiles[0]?.file)"
              @click="click(product, $event)"
              style="max-width: 160px"
            />
          </div>

          <!-- Nomes à direita (40% da largura) -->
          <div
            class="col-6 flex column justify-center items-center text-subtitle1 text-weight-bolder"
          >
            <div>{{ product.product }}</div>
            <div class="text-subtitle2">Categoria</div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import Title from "../title/Title";
import { mapActions } from "vuex";

export default {
  name: "ProductList",
  components: { Title },

  data() {
    return {
      products: [],
    };
  },

  props: {
    filters: {
      type: Object,
      default: () => ({
        itemsPerPage: 3,
        exists: { productFiles: "true" },
        featured: 1,
        productFiles: { file: { fileType: "image" } },
        random: "true",
      }),
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
  },
};
</script>

<style scoped>
.text-subtitle1,
.text-subtitle1 a {
  font-size: 18px;
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
}

.text-subtitle2,
.text-subtitle2 a {
  font-size: 18px;
  color: #000000;
  font-weight: 600;
  text-decoration: none;
}
</style>
