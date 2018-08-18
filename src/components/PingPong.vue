<template>
  <div>
    <navigation class="nav--404"></navigation>
    <div class="ping-pong">
      <login-form :user.sync="user" :handleSubmit="handleSubmit" :isLoading="isLoading" v-if="!loggedIn"/>
      <score-table :players="players" :matches="matches" v-else/>
    </div>
  </div>
</template>

<script>
  import Navigation from './Navigation'
  import Form from './Form'
  import Table from './Table'
  import firebase from 'firebase/app'
  import * as firebaseui from 'firebaseui'
  import * as firestore from 'firebase/firestore'

  console.log('firebase ', firebase)
  console.log('firebaseui ', firebaseui)
  console.log('firestore ', firestore)
  // import uuidv4 from 'uuid/v4'

  const config = {
    apiKey: 'AIzaSyCQoJQe1fQK3zOb-pM0-nuhKpywyzd4P-E',
    authDomain: 'ping-pong-c2ff8.firebaseapp.com',
    databaseURL: 'https://ping-pong-c2ff8.firebaseio.com',
    projectId: 'ping-pong-c2ff8',
    storageBucket: 'ping-pong-c2ff8.appspot.com',
    messagingSenderId: '452644670344'
  }
  firebase.initializeApp(config)

  const db = firebase.firestore()

  db.settings({
    timestampsInSnapshots: true
  })

  export default {
    name: 'about',
    props: [],
    components: { navigation: Navigation, loginForm: Form, scoreTable: Table },
    data () {
      return {
        isLoading: false,
        loggedIn: false,
        players: [],
        matches: [],
        user: {
          email: '',
          name: '',
          password: ''
        }
      }
    },

    mounted () {
      this.isLoading = true
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.setupTable()
        } else {
          this.isLoading = false
          this.loggedIn = false
        }
      })
    },
    methods: {
      setupTable () {
        this.isLoading = false
        this.loggedIn = true
        console.log('firebase.auth().currentUser ', firebase.auth().currentUser)

        db.collection('users').get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            this.players.push({
              id: doc.id,
              ...doc.data()
            })
          })
        })

        db.collection('matches').get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            this.matches.push({
              id: doc.id,
              ...doc.data()
            })
          })
        })
      },
      signIn ({ email, password }) {
        this.isLoading = true
        firebase.auth().signInWithEmailAndPassword(email, password)
          .catch((error) => {
            const { code, message } = error
            // Handle Errors here.
            alert(code === 'auth/wrong-password' ? 'Wrong password.' : message)
            console.log(error)
            if (error) this.createUser(email, password)
          })
      },
      createUser ({ email, password }) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .catch((error) => {
            const { code, message } = error
            // Handle Errors here.
            alert(code === 'auth/weak-password' ? 'The password is too weak.' : message)
            console.log(error)
          })
      },
      handleSubmit () {
        this.signIn(this.user)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
