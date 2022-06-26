const { createMachine } = require('xstate');
const { assign } = require('xstate/lib/actions');

module.exports = () => createMachine({
  id: 'game',
  context: {
    turn: 1,
    numWorkers: 2,
    numWorkersRemaining: 2,
    taskTakeXWood: {
      wood: 2,
      label: 'Take {{wood}} wood',
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
                  target: 'perform'
                }
              }
            },
            perform: {
              invoke: {
                src: 'taskMachine'
              },
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
          }
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
        ctx.taskTakeXWood.wood += 2;
        ctx.taskTakeXWood.selected = false;
        ctx.taskTakeXWood.available = true;
      }

      return ctx;
    })
  },
  guards: {
    endOfStage: ({turn, numWorkersRemaining}) =>
      numWorkersRemaining == 0 && (  turn === 4
                                  || turn === 7
                                  || turn === 9
                                  || turn === 11
                                  || turn === 13
                                  || turn === 14),

    notEndOfGame: ({turn}) => turn < 14
  }
});
