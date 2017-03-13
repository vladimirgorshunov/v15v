<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import Vue from 'vue';
  import Navigation from './components/Navigation';
  
  export default {
    name: 'app',
  };
  Vue.component('navigation', Navigation);

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
