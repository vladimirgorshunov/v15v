<template>
  <div id="app">
    <navigation :class="[navClass]"></navigation>
    <router-view :navigationClass="navClass" @navClassChanged="navClass = $event"></router-view>
  </div>
</template>

<script>
  import Navigation from './components/Navigation';
  
  export default {
    name: 'app',
    components: {
      Navigation,
    },
    data() {
      return {
        navClass: '',
      };
    },
  };

</script>

<style>
  body {
    margin: 0;
    padding: 0;
    font-size: 16px;
  }
  #app {
  
  }
  
</style>
