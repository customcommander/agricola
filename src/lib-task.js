/*

  Defines a blueprint for most tasks.

*/

import {
  fromPromise,
  sendTo,
  setup,
} from 'xstate';

import {
  produce
} from 'immer';

const gamesys = ({system}) => system.get('gamesys');

const dispatcher = ({system}) => system.get('dispatcher');

const lib = setup({
  actions: {
    'game-update':
    sendTo(gamesys, ({event}, {fn, reply_to, ...params}) => ({
      type: 'game.update',
      updater: produce(fn.bind(null, {event, params})),
      reply_to
    })),

    'game-query':
    sendTo(gamesys, (_, {fn, reply_to, ...params}) => ({
      type: 'game.query',
      query: fn,
      reply_to
    })),

    'task-abort':
    sendTo(gamesys, (_, {task_id, err}) => ({
      type: 'task.aborted',
      task_id,
      err
    })),

    'task-ack':
    sendTo(dispatcher, {type: 'task.ack'}),

    'task-complete':
    sendTo(gamesys, {type: 'task.completed'})
  },

  guards: {
    'response-ok?':
    ({event: {response}}) => {
      return response === true;
    }
  }
});

export default function (definitions) {
  const {
    execute,
    check,
    id,
    replenish,
    selection,
    todo
  } = definitions;

  const m = {
    initial: 'idle',

    states: {

      idle: {
        on: {
          'task.replenish': {
            target: 'replenish'
          },

          'task.selected': (
            todo ?
            {
              actions: {
                type: 'task-abort',
                params: {
                  task_id: id,
                  err: 'TODO'
                }
              }
            }

          : //
            {
              target: ( check     ? 'check'
                      : selection ? 'selection' 
                                  : 'execute'   )
            }
          )
        }
      },

      replenish: {
        entry: {
          type: 'game-update',
          params: {
            fn: replenish,
            reply_to: id
          }
        },
        on: {
          'game.updated': {
            target: 'idle',
            actions: 'task-ack'
          }
        }
      },

      check: {
        entry: {
          type: 'game-query',
          params: {
            fn: check,
            reply_to: `task-${id}`
          }
        },
        on: {
          'game.response': [
            {
              guard: 'response-ok?',
              target: ( selection ? 'selection' 
                                  : 'execute'   )
            },
            {
              target: 'idle',
              actions: {
                type: 'task-abort',
                params: {
                  task_id: id,
                  err: 'NOT_ENOUGH_RESOURCES'
                }
              }
            }
          ]
        }
      },

      selection: {
        entry: {
          type: 'game-update',
          params: {
            fn: selection,
            reply_to: id,
          }
        },
        on: {
          'select.*': {
            target: 'execute',
            actions: {
              type: 'game-update',
              params: {
                fn: function clear_selection(_, game) {
                  game.selection = null;
                  return game;
                }
              }
            }
          }
        }
      },

      execute: {
        entry: {
          type: 'game-update',
          params: {
            fn: execute,
            reply_to: id
          }
        },
        on: {
          'game.updated': {
            target: 'idle',
            actions: 'task-complete'
          }
        }
      }
    }
  };

  if (!replenish) {
    delete m.states.idle.on['task.replenish'];
    delete m.states.replenish;
  }

  if (!check) {
    delete m.states.check;
  }

  if (!selection) {
    delete m.states.selection;
  }

  if (!execute) {
    delete m.states.execute;
  }

  // console.log(JSON.stringify(m, (k, v) => typeof v === 'function' ? `<${v.name}>` : v, 2));

  return lib.createMachine(m);
}

