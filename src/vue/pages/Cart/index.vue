<template>
  <Orders
    :context="'purchase'"
    v-if="this.cart && this.cart.id"
    :orderId="this.cart?.id"
  />
</template>

<script>
import Orders from "@controleonline/ui-orders/src/vue/components/Details.vue";
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    Orders,
  },
  computed: {
    ...mapGetters({
      cart: "cart/item",
    }),
  },
  data() {
    return {
    };
  },
  created() {
  },
};
</script>
