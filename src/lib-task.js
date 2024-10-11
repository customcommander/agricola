/*

  Defines a blueprint for most tasks.

*/

import {
  assign,
  enqueueActions,
  fromPromise,
  sendTo,
  setup,
} from 'xstate';

import {
  produce
} from 'immer';

const gamesys = ({system}) => system.get('gamesys');

const dispatcher = ({system}) => system.get('dispatcher');

function early_exit_init({params}, game) {
  game.early_exit = params.task_id;
  return game;
}

function early_exit_stop(_, game) {
  game.early_exit = null;
  return game;
}

function selection_clear(_, game) {
  game.selection = null;
  return game;
}

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
    sendTo(gamesys, ({event}, {task_id, err}) => ({
      type: 'task.aborted',
      task_id,
      err: event.response || err || 'NOT_ENOUGH_RESOURCES'
    })),

    'task-ack':
    sendTo(dispatcher, {type: 'task.ack'}),

    'task-complete':
    enqueueActions(({enqueue, context}) => {
      if (context.exec > 0) {
        enqueue.assign({exec: 0});
        enqueue({type: 'game-update', params: {fn: early_exit_stop}});
      }
      enqueue.sendTo(gamesys, {type: 'task.completed'});
    }),

    'allow-early-exit':
    enqueueActions(({enqueue, context}, params) => {
      if (context.exec === 1) {
        enqueue({
          type: 'game-update',
          params: {
            fn: early_exit_init,
            task_id: params.task_id
          }
        });
      }
    }),

    'exec++':
    assign({exec: ({context}) => context.exec + 1})
  },

  guards: {
    'response-ok?':
    ({event: {response}}) => {
      return response === true;
    },

    'silent-failure?':
    ({event: {response}, context: {exec}}) => {
      return response !== true && exec > 0;
    }
  }
});

export default function (definitions) {
  const {
    execute,
    fields,
    check,
    id,
    repeat = false,
    replenish,
    selection,
    todo
  } = definitions;

  const target = (name, impl) => impl && ({
    [name]: {
      entry: {
        type: 'game-update',
        params: {
          fn: impl,
          reply_to: id
        }
      },
      on: {
        'game.updated': {
          target: 'idle',
          actions: 'task-ack'
        }
      }
    }
  });

  const m = {
    context: {
      /*

        All tasks will go through their execution
        cycle at least once.

        Some can go over it multiple times if the
        player chooses to. (e.g sowing fields)

        In that case we need to allow the player to
        exit the execution cycle.

       */
      exec: 0
    },

    initial: 'idle',

    states: {

      idle: {
        on: {
          ...(replenish && {'task.replenish': 'replenish'}),
          ...(fields    && {'task.fields'   : 'fields'   }),

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

          : execute ?
            {
              target: ( check     ? 'check'
                      : selection ? 'selection' 
                                  : 'execute' )
            }
          : 
            {
            }
          )
        }
      },

      ...(target('replenish', replenish)),
      ...(target('fields'   , fields   )),

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
                                  : 'execute'   ),
              actions: {
                type: 'allow-early-exit',
                params: {
                  task_id: id
                }
              }
            },
            {
              guard: 'silent-failure?',
              target: 'idle',
              actions: 'task-complete'
            },
            {
              target: 'idle',
              actions: {
                type: 'task-abort',
                params: {
                  task_id: id,
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
            task_id: id
          }
        },
        on: {
          'select.*': {
            target: 'execute',
          },
          'task.exit': {
            target: 'idle',
            actions: 'task-complete'
          }
        },
        exit: {
          type: 'game-update',
          params: {
            fn: selection_clear
          }
        }
      },

      ...(execute && {
        execute: {
          entry: {
            type: 'game-update',
            params: {
              fn: execute,
              reply_to: id
            }
          },
          on: {
            'game.updated': (
              repeat ?
              {
                target: 'check',
                actions: 'exec++'
              }
            : /* no repeat*/
              {
                target: 'idle',
                actions: 'task-complete'
              }
            )
          }
        }
      })
    }
  };

  if (!check) {
    delete m.states.check;
  }

  if (!selection) {
    delete m.states.selection;
  }

  // console.log(JSON.stringify(m, (k, v) => typeof v === 'function' ? `<${v.name}>` : v, 2));

  return lib.createMachine(m);
}

