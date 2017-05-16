<template>
  <div>
    <div class="about">
      {{ msg }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'blog',
  props: ['navigationClass'],
  data() {
    return {
      msg: 'blog works, for now',
    };
  },
  created() {
    this.navigationClass = 'nav--blog';
    this.$emit('navClassChanged', this.navigationClass);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
