const { createMachine, spawn, send } = require('xstate');
const { assign } = require('xstate/lib/actions');
const taskMachine = require('./task');
const harvestMachine = require('./harvest');

module.exports = () => createMachine({
  id: 'game',
  context: {
    turn: 1,
    numWorkers: 2,
    numWorkersRemaining: 2,
    takeXWood: {
      wood: 2,
      label: 'Take {{wood}} wood',
      selected: false,
      available: true
    },
    takeXClay: {
      clay: 1,
      label: 'Take %n clay',
      selected: false,
      available: true
    },
    takeXReed: {
      reed: 1,
      label: 'Take %n reed',
      selected: false,
      available: true
    }
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
                  actions: assign({taskRef: () => spawn(taskMachine())})
                },
              }
            },
            perform: {
              entry: [
                send({type: 'START'}, {to: ctx => ctx.taskRef})
              ],
              on: {
                TASK_ABANDONED: {
                  target: 'pick',
                  actions: assign(({numWorkersRemaining}) => ({
                    numWorkersRemaining: numWorkersRemaining + 1
                  }))
                },
                TASK_COMPLETED: [
                  { target: '#game.harvest', cond: 'endOfStage'},
                  { target: 'setup' },
                ]
              }
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
    taskSetup: assign(ctx => {
      const {turn, numWorkers, numWorkersRemaining} = ctx;

      const isNewTurn = numWorkersRemaining == 0;

      ctx.turn = isNewTurn ? turn + 1 : turn;
      ctx.numWorkersRemaining = isNewTurn ? numWorkers - 1 : numWorkersRemaining - 1;

      if (isNewTurn) {
        ctx.takeXWood.wood += 2;
        ctx.takeXWood.selected = false;
        ctx.takeXWood.available = true;

        ctx.takeXClay.clay += 1;
        ctx.takeXClay.selected = false;
        ctx.takeXClay.available = true;

        ctx.takeXReed.reed += 1;
        ctx.takeXReed.selected = false;
        ctx.takeXReed.available = true;
      }

      return ctx;
    })
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
