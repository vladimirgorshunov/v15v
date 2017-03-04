<template>
  <header class="nav">
    <span class="logo">
      V<span class="full-logo">ladimir <br></span>G<span class="full-logo">orshunov</span>
    </span>
    <ul class="list">
      <li class="item">
        <router-link to="about" active-class="active" class="link">ABOUT</router-link>
      </li>
      <!--<li class="item">-->
        <!--<router-link to="blog" active-class="active" class="link">BLOG</router-link>-->
      <!--</li>-->
    </ul>
  </header>
</template>

<script>
export default {
  name: 'navigation',
  data() {
    return {};
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  header {
    position: relative;
    margin: 4.5rem;
  }
  @media (max-width: 700px) {
    header {
      margin-left: 2.25rem;
      margin-right: 2.25rem;
    }
  }
  .logo {
    display: inline-block;
    margin: 0;
    padding: 0;
    font-weight: normal;
    line-height: 1;
    font-size: 4.5rem;
    color: #303030;
    transition: font-size 1s ease-out;
  }
  @media (max-width: 600px) {
    header {
      margin-top: 2.25rem;
      margin-bottom: 2.25rem;
    }
    .logo {
      font-size: 3rem;
    }
    .full-logo {
      display: none;
    }
  }
  .list {
    margin: 0;
    list-style: none;
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .item {
    display: inline-block;
    font-family: "Helvetica Neue", sans-serif;
    font-weight: bold;
    font-size: 1rem;
    margin-right: 2.25rem;
    
    &:last-child {
      margin-right: 0;
    }
  }
  .link {
    text-decoration: none;
    color: #303030;
  
    &.active {
      cursor: default;
      color: #a2a2a2;
    }
  }
  .nav--blog {
    .full-logo {
      display: none;
    }
  }
  .nav--about {
    .list {
      right: 0;
      left: initial;
      transform: translate(0, -50%)
    }
  }
</style>
