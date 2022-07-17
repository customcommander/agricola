const {createMachine} = require('xstate');
const harvestMachine = require('./harvest');
const taskEnded = require('./task-ended.js');
const taskSetup = require('./task-setup.js');
const task_check = require('./task-check.js');
const { is_end_of_stage
      , not_end_of_game } = require('./context-query.js');

module.exports = () => createMachine({
  id: 'game',
  context: {
    turn: 1,
    numWorkers: 2,
    numWorkersRemaining: 2,
    reserve: {
      wood: 0,
      clay: 0,
      reed: 0,
      grain: 0
    },
    task: {
      'take-x-wood': {
        wood: 2,
        selected: false,
      },
      'take-x-clay': {
        clay: 1,
        selected: false,
      },
      'take-x-reed': {
        reed: 1,
        selected: false,
      },
      take_grain: {
        selected: false
      },
      plow_field: {
        selected: false
      }
    },
    spaces:
      { A1: {}                  , A2: {}, A3: {}, A4: {}, A5: {}
      , B1: {type: 'wooden_hut'}, B2: {}, B3: {}, B4: {}, B5: {}
      , C1: {type: 'wooden_hut'}, C2: {}, C3: {}, C4: {}, C5: {}}
  },
  initial: 'start',
  states: {
    start: {
      always: {
        target: 'work'
      }
    },
    work: {
      type: 'parallel',
      states: {
        task: {
          initial: 'setup',
          states: {
            setup: {
              entry: 'taskSetup',
              always: {
                target: 'pick'
              }
            },
            pick: {
              on: {
                TASK_SELECTED: {
                  target: 'perform',
                  actions: 'task_check'
                }
              }
            },
            perform: {
              on: {
                TASK_ABANDONED: {
                  target: 'pick'
                },
                TASK_COMPLETED: [
                  { target: '#game.harvest', cond: 'is_end_of_stage'},
                  { target: 'setup' },
                ]
              },
              exit: 'taskEnded'
            }
          },
        },
        activity: {
          initial: 'pick',
          states: {
            pick: {},
            perform: {}
          }
        }
      }
    },
    harvest: {
      invoke: {
        src: 'harvestMachine',
      },
      on: {
        HARVEST_COMPLETED: [
          { target: 'work', cond: 'not_end_of_game'},
          { target: 'end' }
        ]
      }
    },
    end: {
      type: 'final'
    }
  }
}, {
  actions: {
    task_check,
    taskEnded,
    taskSetup
  },
  guards: {
    is_end_of_stage,
    not_end_of_game
  },
  services: {
    harvestMachine
  }
});
