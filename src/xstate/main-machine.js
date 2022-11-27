import {createMachine, forwardTo} from 'xstate';

export default () => createMachine({
  context: {},
  initial: 'init',
  states: {
    init: {
      invoke: {
        id: 'setup-service',
        src: () => new Promise(res => {
          // Simulates async operations whilst setting up a game (e.g. dynamic imports)
          setTimeout(() => res(true), 50);
        }),
        onDone: {
          target: 'turn_1'
        },
      },
      on: {
        SETUP_GAME: forwardTo('setup-service')
      }
    },
    turn_1: {
      type: 'final'
    }
  }
});
