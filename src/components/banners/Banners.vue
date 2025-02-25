<template>
  <div class="q-pa-sm row col-12">
    <q-carousel
      animated
      v-model="slide"
      arrows
      navigation
      infinite
      class="col-12"
      style="height: 420px"
    >
      <q-carousel-slide
        :name="1"
        img-src="https://cdn.quasar.dev/img/mountains.jpg"
      />
      <q-carousel-slide
        :name="2"
        img-src="https://cdn.quasar.dev/img/parallax1.jpg"
      />
      <q-carousel-slide
        :name="3"
        img-src="https://cdn.quasar.dev/img/parallax2.jpg"
      />
      <q-carousel-slide
        :name="4"
        img-src="https://cdn.quasar.dev/img/quasar.jpg"
      />
    </q-carousel>
  </div>
</template>

<script>
import Title from "../title/Title";

export default {
  components: {
    Title,
  },
  methods: {},

  mounted() {},
  computed: {},
  data() {
    return {
      slide: 1,
    };
  },
};
</script>
