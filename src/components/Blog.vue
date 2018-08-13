<template>
  <div>
    <navigation class="nav--blog"></navigation>
    <div class="about">
      {{ msg }}
    </div>
  </div>
</template>

<script>
  import Navigation from './Navigation'

  export default {
    name: 'blog',
    props: [],
    components: { navigation: Navigation },
    data () {
      return {
        msg: 'blog works, for now'
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
