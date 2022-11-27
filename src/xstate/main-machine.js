import {createMachine, forwardTo} from 'xstate';

import * as actions from './actions/index.js';
import * as guards from './guards/index.js';

export default () => createMachine({
  context: {
    turn: 0,
    stage: 0,
  },
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
          target: 'work'
        },
      },
      on: {
        SETUP_GAME: forwardTo('setup-service')
      }
    },
    work: {
      entry: 'new_turn',
      on: {
        NEW_TURN: {
          target: 'work'
        },
        HARVEST_TIME: {
          target: 'feed'
        }
      }
    },
    feed: {
      invoke: {
        id: 'feed-service',
        src: () => new Promise(res => {
          setTimeout(() => res(true), 50);
        }),
        onDone: [
          {target: 'work', cond: 'not_end_of_game'},
          {target: 'end_of_game'}
        ]
      }
    },
    end_of_game: {
      type: 'final'
    }
  }
}, {
  actions,
  guards
});
