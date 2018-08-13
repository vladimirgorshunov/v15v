<template>
  <div>
    <navigation class="nav--404"></navigation>
    <div class="page-404">
      <div class="page-404--roman">
        CDIV
      </div>
      <div class="page-404--subtitle">Try another page.</div>
    </div>
  </div>
</template>

<script>
  import Navigation from './Navigation'

  export default {
    name: 'Page404',
    props: [],
    components: { navigation: Navigation }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .page-404 {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: calc((100vh - 316px) / 6) 0;
  }

  .page-404--roman {
    font-size: 9rem;
    font-family: 'Libre Baskerville', serif;
    color: #a2a2a2;
  }

  .page-404--subtitle {
    color: #a2a2a2;
    font-family: 'pt-serif', serif;
  }

  @media (max-width: 700px) {
    .page-404 {
      padding: 0;
      margin-top: -120px;
      height: 100vh;
    }

    .page-404--roman {
      font-size: 6rem;
    }
  }

  @media (min-width: 600px) and (max-width: 700px) {
    .page-404 {
      margin-top: -216px;
    }
  }
</style>
