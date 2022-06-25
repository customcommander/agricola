const { createMachine } = require('xstate');
const { assign } = require('xstate/lib/actions');

module.exports = createMachine({
  id: 'game',
  context: {
    turn: 1,
    numWorkers: 2,
    numWorkersRemaining: 2
  },
  initial: 'work',
  states: {
    work: {
      entry: assign(({turn, numWorkers, numWorkersRemaining}) => ({
        turn: numWorkersRemaining == 0 ? turn + 1 : turn,
        numWorkersRemaining: numWorkersRemaining == 0 ? numWorkers - 1 : numWorkersRemaining - 1
      })),
      invoke: {
        src: 'taskMachine'
      },
      on: {
        TASK_ABANDONED: {
          target: 'work',
          actions: assign(({numWorkersRemaining}) => ({
            numWorkersRemaining: numWorkersRemaining + 1
          }))
        },
        TASK_COMPLETED: [
          { target: 'harvest', cond: 'endOfStage'},
          { target: 'work' },
        ]
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
