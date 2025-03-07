<template>
  <Orders :context="context" v-if="context" :orderId="orderId" />
</template>

<script>
import Orders from "@controleonline/ui-orders/src/components/Details.vue";
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
      context: "purchase",
      orderId: null,
    };
  },
  created() {
    this.orderId = cart.id;
  },
};
</script>
