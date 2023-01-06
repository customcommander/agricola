export default () => ({
  id: 'game-engine',
  context: {
    turn: 0,
    stage: 0,
    num_workers: 2,
    tasks: {
/*
  Tasks are things a player can do throughout the game:

  - permanent actions (those printend on the board)
  - turn-based actions
  - minor & major improvement cards
  - occupation cards

  All tasks (including those randomly allocated) are defined
  whilst setting up the game.
*/
    }
  },
  initial: 'setup',
  states: {
    setup: {
      entry: [
        'start_setup_service'
      ],
      on: {
        SETUP_GAME: {
          actions: ['forward_to_setup_service']
        },
        SETUP_DONE: {
          target: 'work',
          actions: ['setup_done']
        }
      }
    },
    work: {
      initial: 'init',
      states: {
        init: {
          entry: [
            'new_turn',
            'start_work_service'
          ],
          on: {
            WORK_SERVICE_READY: {
              target: 'main'
            }
          }
        },
        main: {
          on: {
            WORK_DONE: [
              {target: '#game-engine.work', cond: 'not_harvest'},
              {target: '#game-engine.harvest'}
            ],
            '*': {
              actions: ['forward_to_work_service']
            }
          }
        }
      }
    },
    harvest: {
      initial: 'init',
      states: {
        init: {
          entry: ['start_harvest_service'],
          on: {
            HARVEST_SERVICE_STARTUP: {
              target: 'main'
            }
          }
        },
        main: {
          on: {
            HARVEST_SERVICE_SHUTDOWN: [
              {target: '#game-engine.work', cond: 'not_end_of_game'},
              {target: '#game-engine.end_of_game'}
            ],
            '*': {
              actions: ['forward_to_harvest_service']
            }
          },
          exit: ['stop_harvest_service']
        }
      }
    },
    end_of_game: {
      type: 'final'
    }
  }
});
