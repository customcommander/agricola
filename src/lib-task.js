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

    'task-ack':
    sendTo(dispatcher, {type: 'task.ack'}),

    'task-complete':
    sendTo(gamesys, {type: 'task.completed'})
  }
});

export default function (definitions) {
  const {
    execute,
    id,
    replenish,
  } = definitions;

  const m = {
    initial: 'idle',

    states: {

      idle: {
        on: {
          'task.replenish': {
            target: 'replenish'
          },

          'task.selected': {
            target: 'execute'
          }
        }
      },

      replenish: (
        typeof replenish == 'function' ?
        {
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
        }

      : null

      ),

      execute: (
        {
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
      )
    }
  };

  if (!replenish) {
    delete m.states.idle.on['task.replenish'];
    delete m.states.replenish;
  }

  // console.log(JSON.stringify(m, (k, v) => typeof v === 'function' ? `<${v.name}>` : v, 2));

  return lib.createMachine(m);
}

