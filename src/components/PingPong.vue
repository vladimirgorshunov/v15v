<template>
  <div>
    <navigation class="nav--404"></navigation>
    <div class="ping-pong">
      <form autocomplete="off" @submit.prevent="handleSubmit">
        <label for="email">Email</label>
        <input id="email" name="email" type="text" v-model="user.email">

        <label for="name">Full name</label>
        <input id="name" name="name" type="text" v-model="user.name">

        <label for="password">Password</label>
        <input id="password" name="password" type="password" v-model="user.password">
        <button type="submit">Enter</button>
      </form>
    </div>
  </div>
</template>

<script>
  import Navigation from './Navigation'
  import firebase from 'firebase/app'
  import * as firebaseui from 'firebaseui'

  console.log('firebase ', firebase)
  console.log('firebaseui ', firebaseui)

  const config = {
    apiKey: 'AIzaSyCQoJQe1fQK3zOb-pM0-nuhKpywyzd4P-E',
    authDomain: 'ping-pong-c2ff8.firebaseapp.com',
    databaseURL: 'https://ping-pong-c2ff8.firebaseio.com',
    projectId: 'ping-pong-c2ff8',
    storageBucket: 'ping-pong-c2ff8.appspot.com',
    messagingSenderId: '452644670344'
  }
  firebase.initializeApp(config)

  export default {
    name: 'about',
    props: [],
    components: { navigation: Navigation },
    data () {
      return {
        isLoading: false,
        isLoaded: false,
        user: {
          email: '',
          name: '',
          password: ''
        }
      }
    },
    methods: {
      signIn (email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password)
          .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code
            const errorMessage = error.message
            if (errorCode === 'auth/wrong-password') {
              alert('Wrong password.')
            } else {
              alert(errorMessage)
            }
            console.log(error)
            if (error) {
              this.createUser(email, password)
            } else {
              this.isLoading = false
            }
          })
          .then(data => {
            firebase.auth().currentUser.updateProfile({
              displayName: this.user.name
            }).then(() => {
              // Update successful.
            }).catch(error => {
              console.log('error ', error)
            })

            console.log('firebase.auth().currentUser ', firebase.auth().currentUser)
          })
      },
      createUser (email, password) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code
            const errorMessage = error.message
            if (errorCode === 'auth/weak-password') {
              alert('The password is too weak.')
            } else {
              alert(errorMessage)
            }
            console.log(error)
          })
          .then(data => {
            firebase.auth().currentUser.updateProfile({
              displayName: this.user.name
            }).then(() => {
              // Update successful.
              this.isLoading = false
            }).catch(error => {
              console.log('error ', error)
            })

            console.log('firebase.auth().currentUser ', firebase.auth().currentUser)
          })
      },
      handleSubmit (e) {
        console.log(e)
        const { email, name, password } = this.user
        this.isLoading = true
        console.log('email ', email)
        console.log('name ', name)
        console.log('password ', password)

        this.signIn(email, password)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  p, input, button {
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

  .wf-active p,
  .wf-active input,
  .wf-active button {
    font-family: 'pt-serif', serif;
  }

  form {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column;
    width: 432px;
    margin: 0 auto;
  }

  label {
    margin-bottom: 8px;
  }

  input {
    margin-bottom: 16px;
    line-height: 40px;
    font-size: 16px;
    padding: 0 16px;
    outline: none;
    box-shadow: none;
    background-color: #fff;
    color: #303030;
    border: 1px solid #575757;
    width: 100%;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus
  textarea:-webkit-autofill,
  textarea:-webkit-autofill:hover
  textarea:-webkit-autofill:focus,
  select:-webkit-autofill,
  select:-webkit-autofill:hover,
  select:-webkit-autofill:focus {
    -webkit-text-fill-color: #303030;
  }

  input:focus {
    outline: none;
    border: 1px solid rgba(48, 48, 48, 0.9);
  }

  button {
    border: 0;
    line-height: 40px;
    display: inline-block;
    color: #fff;
    max-width: 168px;
    cursor: pointer;
    background-color: rgba(48, 48, 48, 1);
  }

  button:hover {
    background-color: #575757;
  }

</style>
