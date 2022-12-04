import {interpret, createMachine, forwardTo} from 'xstate';

import * as actions from './actions/index.js';
import * as guards from './guards/index.js';
import * as services from './services/index.js';

const machine = () => createMachine({
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
      entry: [
        'new_turn',
        'start_work_service'
      ],
      on: {
        WORK_DONE: [
          {target: 'work', cond: 'not_harvest'},
          {target: 'feed'}
        ]
      },
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
}, {
  actions,
  guards,
  services
});

// TODO:
// Eventually this event will be responsible for:
//  1.  Selecting occupation cards
//  2.  Selecting minor improvement cards
//  3.  Randomizing the round cards
const init_game = () => ({
  type: 'SETUP_GAME'
});

// Returns a reference to the main machine as well as a function to start the game.
export default () => {
  const game = interpret(machine());
  const start = (events) => {
    game.start();
    game.send(events ?? [init_game()]);
  };
  return [game, start];
};
