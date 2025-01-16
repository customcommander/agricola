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

const task_setup = setup({
  actors: {
    fields: service_not_implemented,
    replenish: service_not_implemented,
    selected: service_not_implemented
  },
  actions: {
    abort_task,
    acknowledge_task,
    complete_task
  },
  guards: {
    is_todo
  }
});


const task = task_id => task_setup.createMachine({
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
        },
        'task.replenish': {
          target: 'replenish',
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
    replenish: {
      invoke: {
        src: 'replenish',
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
              params: {
                task_id,
                err: 'TODO'
              }
            }
          },
          {
            target: 'idle',
            actions: {
              type: 'complete_task',
              params: {
                task_id
              }
            }
          }
        ]
      }
    }
  }
});

export default ({id, ...actors}) => {
  const t = task(id);
  return t.provide({
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
};

