import {interpret, createMachine, forwardTo} from 'xstate';

import * as actions from './actions/index.js';
import * as guards from './guards/index.js';

const machine_def = {
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
};

// TODO:
// Eventually this event will be responsible for:
//  1.  Selecting occupation cards
//  2.  Selecting minor improvement cards
//  3.  Randomizing the round cards
const initGame = () => ({
  type: 'SETUP_GAME'
});

// Starts a new game unless `events` is not nil (i.e replaying a game)
export default (events) => {
  const game = interpret(createMachine(machine_def, {actions, guards}));
  game.start();
  game.send(events ?? [initGame()]);
  return game;
};
