<template>
  <div class="table-wrapper">
    <div class="table">
      <div
        class="table-head"
        :style="{ gridTemplateColumns: `repeat(${players.length}, 1fr)` }">
        <div v-for="player in players">
          <span>{{player.name}}</span>
        </div>
      </div>
      <div class="table-left" :style="{ gridTemplateRows: `repeat(${players.length}, 40px)` }">
        <div v-for="player in players">{{player.name}}</div>
      </div>
      <div class="table-content" :style="{ gridTemplateRows: `repeat(${players.length}, 40px)` }">
        <div
          class="table-row"
          v-for="player in players"
          :style="{ gridTemplateColumns: `repeat(${players.length}, 1fr)` }">
          <div class="table-cell" v-for="(subplayer) in players">
                <span v-if="table && table[player.id] && table[player.id][subplayer.id]">
                  {{table[player.id][subplayer.id].home + ':' + table[player.id][subplayer.id].away}}
                </span>
            <span v-else>-</span>
            <!--<span>{{index + ' : ' + index}}</span>-->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Table',
    props: {
      players: Array,
      matches: Array
    },

    computed: {
      table: function () {
        return this.convertToTable(this.matches)
      }
    },
    methods: {
      convertToTable (matches) {
        let table = {}

        matches.forEach((match) => {
          if (table[match.home.userId]) {
            if (table[match.home.userId][match.away.userId]) {
              table[match.home.userId][match.away.userId].home += match.home.score
              table[match.home.userId][match.away.userId].away += match.away.score
            } else {
              table[match.home.userId] = {
                ...table[match.home.userId],
                [match.away.userId]: {
                  home: match.home.score,
                  away: match.away.score
                }
              }
            }
          } else {
            table[match.home.userId] = {
              [match.away.userId]: {
                home: match.home.score,
                away: match.away.score
              }
            }
          }

          if (table[match.away.userId]) {
            if (table[match.away.userId][match.home.userId]) {
              table[match.away.userId][match.home.userId].home += match.away.score
              table[match.away.userId][match.home.userId].away += match.home.score
            } else {
              table[match.away.userId] = {
                ...table[match.away.userId],
                [match.home.userId]: {
                  home: match.away.score,
                  away: match.home.score
                }
              }
            }
          } else {
            table[match.away.userId] = {
              [match.home.userId]: {
                home: match.away.score,
                away: match.home.score
              }
            }
          }
        })
        return table
      }
    }
  }
</script>

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
  @for $i from 1 through 16 {
    .table-row:nth-child(#{$i}) .table-cell:nth-child(#{$i}) {
      background-color: #a2a2a2;
      color: #a2a2a2;
      height: 100%;
    }
  }
</style>
