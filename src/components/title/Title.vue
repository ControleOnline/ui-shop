<template>
  <div class="q-pa-md row col-12 justify-center titleConfigBg">
    <span class="titleBase"> {{ $tt(this.$route.name, "title", title) }}</span>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      required: true,
      default: "",
    },
  },

  data() {},
};
</script>

<style scoped>
.titleBase {
  line-height: 2.5em;
  text-align: center;
  font-size: 18px;
  color: #000000;
  font-weight: 500;
}

.titleConfigBg {
  background-color: #cbe8ec;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 35px !important;
}
</style>
