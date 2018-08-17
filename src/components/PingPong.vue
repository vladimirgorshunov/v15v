<template>
  <div>
    <navigation class="nav--404"></navigation>
    <div class="ping-pong">
      <login-form :user.sync="user" :handleSubmit="handleSubmit" :isLoading="isLoading" v-if="loggedIn"/>
      <div class="table-wrapper" v-else>
        <div class="table">
          <div class="table-head">
            <div v-for="player in players">
              <span>{{player.name}}</span>
            </div>
          </div>
          <div class="table-left">
            <div v-for="player in players">{{player.name}}</div>
          </div>
          <div class="table-content">
            <div class="table-row" v-for="player in players">
              <div v-for="(subplayer, index) in players">
                <span v-if="table && table[player.id] && table[player.id][subplayer.id]">{{table[player.id][subplayer.id].home + ':' + table[player.id][subplayer.id].away}}</span>
                <span v-else>0:0</span>
                <!--<span>{{index + ' : ' + index}}</span>-->
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
  import Navigation from './Navigation'
  import Form from './Form'
  import firebase from 'firebase/app'
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

  export default {
    name: 'about',
    props: [],
    components: { navigation: Navigation, loginForm: Form },
    data () {
      return {
        isLoading: false,
        loggedIn: false,
        players: [
          {id: 1, name: 'Vladimir'},
          {id: 2, name: 'Ludvig'},
          {id: 3, name: 'Ludwig'},
          {id: 4, name: 'David'},
          {id: 5, name: 'Vladimir'},
          {id: 6, name: 'Ludvig'},
          {id: 7, name: 'Ludwig'},
          {id: 8, name: 'David'},
          {id: 9, name: 'Vladimir'},
          {id: 10, name: 'Ludvig'},
          {id: 11, name: 'Ludwig'},
          {id: 12, name: 'David'}
        ],
        matches: [],
        table: {
          1: {
            2: {
              home: 1,
              away: 2
            }
          }
        },
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
            }
            this.isLoading = false
          })
          .then(() => {
            firebase.auth().currentUser.updateProfile({
              displayName: this.user.name
            }).then(() => {
              console.log('firebase.auth().currentUser ', firebase.auth().currentUser)

              this.isLoading = false
              this.loggedIn = true
              // Update successful.
            }).catch(error => {
              console.log('error ', error)
            })
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

              console.log('firebase.auth().currentUser ', firebase.auth().currentUser)
            }).catch(error => {
              console.log('error ', error)
            })
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

        /*
  table {
    display: flex;
    flex-direction: column;
  }

  thead {
    display: flex;
    justify-content: space-evenly;
  }

  tbody {
    display: flex;
    flex-direction: column;
  }
  tr {
    display: flex;
    justify-content: space-evenly;
    width: 100%;
  }

  tr th {
    box-sizing: border-box;
    min-height: 36px;
    display: inline-block;
    padding: 8px 0;
    font-size: 16px;
    line-height: 24px;
    flex-grow: 1;
  }

  tr td {
    box-sizing: border-box;
    min-height: 36px;
    display: inline-block;
    padding: 8px 0;
    font-size: 16px;
    line-height: 24px;
    flex-grow: 1;
    text-align: center;
  }

  @for $i from 1 through 16 {
    tr:nth-child(#{$i}) td:nth-child(#{$i + 1}) {
      background-color: #a2a2a2;
      color: #a2a2a2;
    }
  }
  tr th:first-child,
  tr td:first-child {
    padding-left: 0;
    text-align: left;
    width: 100px;
    font-weight: 700;
    flex-grow: 1.1;
  }
*/
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

  .table-wrapper {
    padding: 1.5rem 4.5rem;
    margin: 0 auto;
    font-size: 1rem;
  }

  .table {
    display: grid;
    grid-template-columns: 120px 1fr;
    grid-template-rows: 120px 1fr;
  }

  .table-head {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 120px;
    align-items: center;
    & > * {
      text-align: center;
    }
    span {
      transform: rotate(-90deg);
      display: inline-block;
    }
  }

  .table-left {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
    display: grid;
    grid-template-rows: repeat(12, 40px);
    align-items: center;
    & > * {
      text-align: left;
    }
  }

  .table-content {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
    display: grid;
    grid-template-rows: repeat(12, 40px);
    align-items: center;
  }
  .table-row {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 40px;
    align-items: center;
    & > * {
      text-align: center;
    }
  }
</style>
