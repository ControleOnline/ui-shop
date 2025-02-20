<template>
  <div class="row col-12 q-pa-md">
    <Title :title="'Destaque'" />

  </div>
  <div class="row col-12">
    
    <div class="col-4 q-pa-md">
      <q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
        <div class="absolute-bottom text-subtitle1 text-center">
          Destaque 01
        </div>
      </q-img>
    </div>
    <div class="col-4 q-pa-md">
      <q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
        <div class="absolute-bottom text-subtitle1 text-center">
          Destaque 02
        </div>
      </q-img>
    </div>
    <div class="col-4 q-pa-md">
      <q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
        <div class="absolute-bottom text-subtitle1 text-center">
          Destaque 03
        </div>
      </q-img>
    </div>
  </div>
</template>

<script>
import Title from "../title/Title";

export default {
  name: "PageCategories",

  components: { Title },
};
</script>

<style scoped></style>
