import {interpret, createMachine, forwardTo} from 'xstate';

import * as actions from './actions/index.js';
import * as guards from './guards/index.js';
import * as services from './services/index.js';

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
        src: 'setup',
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
      invoke: {
        id: 'work-service',
        src: 'work',
        onDone: [
          {target: 'work', cond: 'not_harvest'},
          {target: 'feed'}
        ]
      }
    },
    feed: {
      invoke: {
        id: 'feed-service',
        src: 'feed',
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
  const game = interpret(createMachine(machine_def, {actions, guards, services}));
  game.start();
  game.send(events ?? [initGame()]);
  return game;
};
