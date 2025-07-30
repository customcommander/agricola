import { produce } from "immer";
import { fromPromise, sendTo, setup, log } from "xstate";

const game = ({system}) => system.get('gamesys');
const dispatcher = ({system}) => system.get('dispatcher');

const service_not_implemented = fromPromise(() => {
  throw new Error('service not implemented');
});

const update_game = sendTo(game, ({ event}, {fn, task_id, ...params}) => ({
  type: 'game.update',
  updater: produce(fn.bind(null, {
    task_id,
    event,
    params
  })),
}));

const abort_task = sendTo(game, ({event}, {task_id, err}) => ({
  type: 'task.aborted',
  task_id,
  err: event.response || err || 'NOT_ENOUGH_RESOURCES'
}));

const acknowledge_task = sendTo(dispatcher, {
  type: 'task.ack'
});

const complete_task = sendTo(game, (_, {task_id}) => ({
  type: 'task.completed',
  task_id
}));

export const todo = fromPromise(() => 'TODO');

function is_todo({event}) {
  return event.output === 'TODO';
}

export const game_updater = fn =>
  setup({
    actions: {
      update_game
    },
  })
  .createMachine({
    context: ({input}) => ({
      task_id: input.task_id
    }),
    initial: 'execute',
    states: {
      execute: {
        always: {
          target: 'done',
          actions: {
            type: 'update_game',
            params: ({context}) => ({
              task_id: context.task_id,
              fn
            })
          }
        }
      },
      done: {
        type: 'final'
      }
    }
  });

const task = 
  setup({
    actors: {
      fields: service_not_implemented,
      replenish: service_not_implemented,
      selected: service_not_implemented
    },
    actions: {
      log_init: log(({context}) => `task ${context.task_id} loaded.`),
      abort_task,
      acknowledge_task,
      complete_task
    },
    guards: {
      is_todo
    }
  })
  .createMachine({
    context: ({input}) => ({
      task_id: input.task_id
    }),
    initial: 'init',
    states: {
      init: {
        always: {
          target: 'idle',
          actions: 'log_init'
        }
      },
      idle: {
        on: {
          'task.fields': {
            target: 'fields'
          },
          'task.selected': {
            target: 'selected'
          },
          'task.replenish': {
            target: 'replenish',
          }
        }
      },
      fields: {
        invoke: {
          src: 'fields',
          input: ({context}) => ({
            task_id: context.task_id
          }),
          onDone: {
            target: 'idle',
            actions: 'acknowledge_task'
          }
        }
      },
      replenish: {
        invoke: {
          src: 'replenish',
          input: ({context}) => ({
            task_id: context.task_id
          }),
          onDone: {
            target: 'idle',
            actions: 'acknowledge_task'
          }
        }
      },
      selected: {
        invoke: {
          src: 'selected',
          input: ({context}) => ({
            task_id: context.task_id
          }),
          onDone: [
            {
              guard: 'is_todo',
              target: 'idle',
              actions: {
                type: 'abort_task',
                params: ({context}) => ({
                  task_id: context.task_id,
                  err: 'TODO'
                })
              }
            },
            {
              target: 'idle',
              actions: {
                type: 'complete_task',
                params: ({context}) => ({
                  task_id: context.task_id
                })
              }
            }
          ]
        }
      }
    }
  });

export default ({...actors}) => {
  return task.provide({
    actors: Object.fromEntries(
      Object.entries(actors).map(([k, v]) => {
        if (typeof v == 'function') {
          return [k, game_updater(v)];
        }
        if (v === 'TODO') {
          return [k, todo];
        }
        return [k, v];
      })
    )
  });
}

