const { createMachine, spawn, send } = require('xstate');
const { assign, pure, escalate } = require('xstate/lib/actions');
const {patchInPlace: mutate} = require('jiff');
const task = require('./task/index.js');
const harvestMachine = require('./harvest');

module.exports = () => createMachine({
  id: 'game',
  context: {
    turn: 1,
    numWorkers: 2,
    numWorkersRemaining: 2,
    reserve: {
      wood: 0,
      clay: 0,
      reed: 0
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
      }
    },
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
                    return assign({taskRef: () => spawn(task[e.task](ctx))})
                  })
                }
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
              },
              exit: assign((ctx, ev) => {
                if (ev.type != 'TASK_COMPLETED') return ctx;
                return mutate(task[ev.task].onTaskCompleted(ctx), ctx);
              })
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
        mutate(task['take-x-wood'].onNewTurn(ctx), ctx);
        mutate(task['take-x-clay'].onNewTurn(ctx), ctx);
        mutate(task['take-x-reed'].onNewTurn(ctx), ctx);
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
