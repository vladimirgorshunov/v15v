<template>
  <div>
    <div class="about">
      <p>
        I am a web-developer with {{ yearsOfExperience }} years of experience in creating web sites and applications.<br>
        You can check my CV <a href="/static/CV.pdf">here</a>.
      </p>
      <div class="contact-me">
        <span class="contact-me__text">Contact me via:</span>
        <ul class="contact-me__list">
          <li class="contact-me__item" v-for="link in links">
            <a class="contact-me__link" :href="link.href" rel="noopener noreferrer" target="_blank">{{ link.text }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'about',
    props: ['navigationClass'],
    data () {
      return {
        links: [
          {
            href: 'https://github.com/vladimirgorshunov',
            text: 'Github'
          },
          {
            href: 'https://t.me/gorshunov',
            text: 'Telegram'
          },
          {
            href: 'https://www.linkedin.com/in/gorshunovvladimir/',
            text: 'LinkedIn'
          },
          {
            href: 'skype:gorshunov777?action',
            text: 'Skype'
          },
          {
            href: 'mailto:gorshunov.vladimir@gmail.com',
            text: 'Mail'
          }
        ]
      }
    },
    computed: {
      yearsOfExperience: () => {
        return Math.floor((Date.now() - 1346533200000) / (1000 * 60 * 60 * 24 * 365))
      }
    },
    created () {
      this.$emit('navClassChanged', 'nav--about')
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .about {
    margin: 0 4.5rem;
    padding-top: 1rem;
  }

  @media (max-width: 700px) {
    .about {
      margin: 0 2.25rem;
    }
  }

  p {
    color: #303030;
    width: 24.5rem;
    font-size: 1.0625rem;
    font-family: Georgia, serif;
    line-height: 1.455;
    letter-spacing: 0.1px;
    word-spacing: -0.25px;
  }

  p a {
    color: #303030;
    text-decoration: underline;
  }

  .wf-active p {
    font-family: 'pt-serif', serif;
  }

  @media (max-width: 600px) {
    p {
      width: 100%;
      text-align: center;
      font-size: 1.3rem;
    }
  }

  .contact-me {
    font-family: 'Helvetica Neue', sans-serif;
  }

  .contact-me__text {
    padding-right: 1rem;
    color: #a2a2a2;
  }

  .contact-me__list {
    display: inline-block;
    padding-left: 0;
  }

  .contact-me__item {
    list-style: none;
    display: inline-block;
    padding-right: 0.5rem;
  }

  .contact-me__link {
    text-decoration: none;
    color: #575757;
  }

  @media (max-width: 600px) {
    .contact-me {
      margin-top: 4rem;
    }
  }

  /* ----------- iPhone 5, 5S and SE in landscape mode----------- */

  @media screen
  and (min-width: 320px)
  and (max-width: 568px)
  and (-webkit-min-device-pixel-ratio: 2)
  and (orientation: landscape) {
    .about {
      padding-top: 0.5rem;
    }

    .contact-me {
      margin-top: 2.25rem
    }
  }

  /* ----------- iPhone 6, 6s, 7 and 8 in landscape mode----------- */

  @media screen
  and (min-width: 569px)
  and (max-width: 667px)
  and (-webkit-min-device-pixel-ratio: 2)
  and (orientation: landscape) {
    .about {
      padding-top: 0.5rem;
    }

    .contact-me {
      margin-top: 2.25rem
    }
  }

  /* ----------- iPhone X ----------- */

  @media screen
  and (min-width: 724px)
  and (max-width: 812px)
  and (-webkit-min-device-pixel-ratio: 3)
  and (orientation: landscape) {

    .about {
      padding-top: 0.5rem;
    }

    p {
      font-size: 1.25rem;
      width: 30rem;
    }
  }

  /* ----------- iPhone 6+, 6s+, 7+ and 8+ in landscape mode----------- */

  @media screen
  and (min-width: 414px)
  and (max-width: 736px)
  and (-webkit-min-device-pixel-ratio: 3)
  and (orientation: landscape) {
    .about {
      padding-top: 0.5rem;
    }

    .contact-me {
      margin-top: 2.25rem
    }

    p {
      font-size: 1.25rem;
      width: 30rem;
    }
  }

</style>
