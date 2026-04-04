<template>
  <div class="q-pa-sm row col-12 justify-center titleConfigBg text-primary">
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
  line-height: 3em;
  font-size: 25px;
  color: var(--text-primary);
  font-weight: 500;
}

.titleConfigBg {
  background-color: var(--primary);
  padding: 0px;
  height: 80px;
}
</style>
