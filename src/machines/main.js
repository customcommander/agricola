const {createMachine} = require('xstate');
const {pure, escalate, log} = require('xstate/lib/actions');
const {assign} = require('@xstate/immer');
const harvestMachine = require('./harvest');
const taskEnded = require('./task-ended.js');
const taskSetup = require('./task-setup.js');

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
              entry: [
                'taskSetup'
              ],
              always: {
                target: 'pick'
              }
            },
            pick: {
              on: {
                TASK_SELECTED: {
                  target: 'perform',
                  actions: pure((ctx, e) => {
                    const taskId = e.task;
                    const taskNotAvail = ctx.task[taskId].selected == true;
                    if (taskNotAvail) {
                      return escalate({message: `action '${taskId}' is not available.`});
                    }
                    return log(`Performing task: ${taskId}`);
                  })
                }
              }
            },
            perform: {
              on: {
                TASK_ABANDONED: {
                  target: 'pick'
                },
                TASK_COMPLETED: [
                  { target: '#game.harvest', cond: 'endOfStage'},
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
          { target: 'work', cond: 'notEndOfGame'},
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
    taskSetup,
    taskEnded
  },
  guards: {
    endOfStage: ({turn, numWorkersRemaining}) =>
      numWorkersRemaining == 0 && (  turn === 4  /* end of stage 1 */
                                  || turn === 7  /* end of stage 2 */
                                  || turn === 9  /* end of stage 3 */
                                  || turn === 11 /* end of stage 4 */
                                  || turn === 13 /* end of stage 5 */
                                  || turn === 14 /* end of stage 6 */),

    notEndOfGame: ({turn}) => turn < 14
  },
  services: {
    harvestMachine
  }
});
