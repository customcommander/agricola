import { produce } from "immer";
import { fromPromise, sendTo, setup } from "xstate";

const game = ({system}) => system.get('gamesys');
const dispatcher = ({system}) => system.get('dispatcher');

const service_not_implemented = fromPromise(() => {
  throw new Error('service not implemented');
});

const update_game = sendTo(game, ({event}, {fn, ...params}) => ({
  type: 'game.update',
  updater: produce(fn.bind(null, {event, params})),
}));

const abort_task = sendTo(game, ({event}, {task_id, err}) => ({
  type: 'task.aborted',
  task_id,
  err: event.response || err || 'NOT_ENOUGH_RESOURCES'
}));

const acknowledge_task = sendTo(dispatcher, {
  type: 'task.ack'
});

export const todo =
  setup({
    actions: {
      abort_task
    }
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
            type: 'abort_task',
            params: ({context}) => ({
              task_id: context.task_id,
              err: 'TODO'
            })
          }
        }
      },
      done: {
        type: 'final'
      }
    }
  });

export const game_updater = fn =>
  setup({
    actions: {
      update_game
    },
  })
  .createMachine({
    initial: 'execute',
    states: {
      execute: {
        always: {
          target: 'done',
          actions: {
            type: 'update_game',
            params: {
              fn
            }
          }
        }
      },
      done: {
        type: 'final'
      }
    }
  });

const task = task_id =>
  setup({
    actors: {
      fields: service_not_implemented,
      selected: service_not_implemented
    },
    actions: {
      acknowledge_task,
    },
  })
  .createMachine({
    context: {
      task_id,
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          'task.fields': {
            target: 'fields'
          },
          'task.selected': {
            target: 'selected'
          }
        }
      },
      fields: {
        invoke: {
          src: 'fields',
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
          onDone: {
            target: 'idle',
          }
        }
      }
    }
  });

export default ({id, ...actors}) => task(id).provide({actors});

