<template>
  <div>
    <navigation class="nav--blog"></navigation>
    <div class="about">
      {{ msg }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'blog',
  data() {
    return {
      msg: 'blog works, for now',
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
