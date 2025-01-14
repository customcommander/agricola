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

const acknowledge_task = sendTo(dispatcher, {
  type: 'task.ack'
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

const task =
  setup({
    actors: {
      'fields': service_not_implemented,
    },
    actions: {
      acknowledge_task,
    },
  })
  .createMachine({
    initial: 'idle',
    states: {
      idle: {
        on: {
          'task.fields': {
            target: 'fields'
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
      }
    }
  });

export default (actors) => task.provide({actors});

