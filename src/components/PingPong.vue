<template>
  <div>
    <navigation class="nav--404"></navigation>
    <div class="ping-pong">
      <login-form :user.sync="user" :handleSubmit="handleSubmit" :isLoading="isLoading" v-if="!loggedIn"/>
      <div v-else>
        <form class="join-game" @submit.prevent="addUserToGame">
          <label for="name">Join:</label>
          <input id="name" name="name" type="text" v-model="user.name" placeholder="Full name" required>
          <button type="submit" :disabled="isLoading">{{isLoading ? ' ' : 'Enter'}}</button>
        </form>
        <form class="enter-score" @submit.prevent="addMatch">
          <div class="home-score">
            <select name="home" id="homePlayer" v-model="homePlayer" title="Home player">
              <option value="">-</option>
              <option :value="player.id" v-for="player in players" v-if="awayPlayer !== player.name">{{player.name}}</option>
            </select>
            <input type="number" min="0" v-model="homePlayerScore" title="Home player Score">
          </div>
          <div class="away-score">
            <select name="away" id="awayPlayer" v-model="awayPlayer" title="Away player">
              <option value="">-</option>
              <option :value="player.id" v-for="player in players" v-if="homePlayer !== player.name">{{player.name}}</option>
            </select>
            <input type="number" min="0" v-model="awayPlayerScore" title="Away player score">
          </div>
          <button type="submit" :disabled="isLoading">{{isLoading ? ' ' : 'Enter'}}</button>
        </form>
        <score-table :players="players" :matches="matches"/>
      </div>
    </div>
  </div>
</template>

<script>
  import Navigation from './Navigation'
  import Form from './Form'
  import Table from './Table'
  import uuidv4 from 'uuid/v4'
  import firebase from 'firebase/app'
  import * as firebaseui from 'firebaseui'
  import * as firestore from 'firebase/firestore'

  console.log('firebase ', firebase)
  console.log('firebaseui ', firebaseui)
  console.log('firestore ', firestore)

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
        homePlayer: '',
        awayPlayer: '',
        homePlayerScore: 0,
        awayPlayerScore: 0,
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
      getUsers () {
        db.collection('users').get().then((querySnapshot) => {
          this.players = []
          querySnapshot.forEach((doc) => {
            this.players.push({
              id: doc.id,
              ...doc.data()
            })
          })
        })
      },
      getMatches () {
        db.collection('matches').get().then((querySnapshot) => {
          this.matches = []
          querySnapshot.forEach((doc) => {
            this.matches.push({
              id: doc.id,
              ...doc.data()
            })
          })
        })
      },
      setupTable () {
        this.isLoading = false
        this.loggedIn = true
        console.log('firebase.auth().currentUser ', firebase.auth().currentUser)

        this.getUsers()
        this.getMatches()
      },
      addUserToGame () {
        db.collection('users').doc(uuidv4()).set({
          name: this.user.name
        }).then(() => {
          this.user.name = ''
          this.getUsers()
        })
      },
      addMatch () {
        const payload = {
          home: {
            userId: this.homePlayer,
            score: +this.homePlayerScore
          },
          away: {
            userId: this.awayPlayer,
            score: +this.awayPlayerScore
          }
        }
        console.log('payload ', payload)
        db.collection('matches').doc(uuidv4()).set(payload)
          .then(() => {
            this.homePlayer = ''
            this.homePlayerScore = 0
            this.awayPlayer = ''
            this.awayPlayerScore = 0
            this.getMatches()
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
  .join-game {
    padding: 1.5rem 4.5rem 1rem;
    margin: 0;
    font-size: 1rem;
    width: 432px;
    display: flex;
    align-items: center;
    > * {
      margin-right: 8px;
    }
  }

  .enter-score {
    padding:  1rem 4.5rem 1.5rem;
    margin: 0;
    font-size: 1rem;
    width: 432px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .home-score, .away-score {
    display: flex;
    flex-direction: row;
    margin-bottom: 8px;
    > * {
      margin-right: 8px;
    }
  }

  p, input, button, select {
    color: #303030;
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
  .wf-active select,
  .wf-active button {
    font-family: 'pt-serif', serif;
  }

  input, select {
    font-size: 16px;
    padding: 0 16px;
    min-height: 27px;
    outline: none;
    box-shadow: none;
    background-color: #fff;
    color: #303030;
    border: 1px solid #575757;
    width: 100%;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  textarea:-webkit-autofill,
  textarea:-webkit-autofill:hover,
  textarea:-webkit-autofill:focus,
  select:-webkit-autofill,
  select:-webkit-autofill:hover,
  select:-webkit-autofill:focus {
    -webkit-text-fill-color: #303030;
  }

  input:focus, select:focus {
    outline: none;
    border: 1px solid rgba(48, 48, 48, 0.9);
  }

  button {
    border: 0;
    display: inline-block;
    color: #fff;
    max-width: 168px;
    cursor: pointer;
    background-color: rgba(48, 48, 48, 1);
  }

  button:disabled, button:disabled:hover {
    background-color: #a2a2a2;
    cursor: default;
  }

  button:hover {
    background-color: #575757;
  }
</style>
