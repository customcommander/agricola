import {createMachine} from 'xstate';

export default () => createMachine({
  context: {},
  initial: 'init',
  states: {
    init: {
      on: {
        SETUP_GAME: {
          target: 'setup'
        }
      }
    },
    setup: {
      invoke: {
        src: () => new Promise(res => {
          // Simulates async operations whilst setting up a game (e.g. dynamic imports)
          setTimeout(() => res(true), 50);
        }),
        onDone: {
          target: 'turn_1'
        }
      }
    },
    turn_1: {
      type: 'final'
    }
  }
});
