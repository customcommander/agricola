import {id} from './utils.js';

export default () => ({
  id: 'game-engine',
  context: {
    turn: 0,
    stage: 0,
    tasks_order: [],
    tasks: {
      1: {
        id: 1,
        available: false,
        change_id: id()
      },
      2: {
        id: 2,
        available: false,
        change_id: id()
      },
      3: {
        id: 3,
        available: false,
        change_id: id()
      },
      4: {
        id: 4,
        available: false,
        change_id: id()
      },
      5: {
        id: 5,
        available: false,
        change_id: id()
      },
      6: {
        id: 6,
        available: false,
        change_id: id()
      },
      7: {
        id: 7,
        available: false,
        change_id: id()
      },
      8: {
        id: 8,
        available: false,
        change_id: id()
      },
      9: {
        id: 9,
        available: false,
        change_id: id()
      },
      10: {
        id: 10,
        available: false,
        change_id: id()
      },
      11: {
        id: 11,
        available: false,
        change_id: id()
      },
      12: {
        id: 12,
        available: false,
        change_id: id()
      },
      13: {
        id: 13,
        available: false,
        change_id: id()
      },
      14: {
        id: 14,
        available: false,
        change_id: id()
      },
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
      invoke: {
        id: 'harvest-service',
        src: 'harvest',
        onDone: [
          {target: 'work', cond: 'not_end_of_game'},
          {target: 'end_of_game'}
        ]
      }
    },
    end_of_game: {
      type: 'final'
    }
  }
});
