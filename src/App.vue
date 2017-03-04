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
  @font-face {
    font-family: 'Arvo-Regular';
    src: url('./assets/fonts/Arvo-Regular.ttf');
  }
  @font-face {
    font-family: 'PT-Serif-Regular';
    src: url('./assets/fonts/PT_Serif-Web-Regular.ttf');
  }
  #app {
    font-family: 'Arvo-Regular', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
