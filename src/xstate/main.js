import {interpret, createMachine} from 'xstate';
import shuffle from 'array-shuffle';

import * as actions from './actions/index.js';
import * as guards from './guards/index.js';
import * as services from './services/index.js';
import {id} from './utils.js';

const machine = () => createMachine({
  context: {
    turn: 0,
    stage: 0,
    tasks_order: [],
    tasks: {
      1: {
        id: 1,
        available: false,
        change_id: id()
      },
      2: {
        id: 2,
        available: false,
        change_id: id()
      },
      3: {
        id: 3,
        available: false,
        change_id: id()
      },
      4: {
        id: 4,
        available: false,
        change_id: id()
      },
      5: {
        id: 5,
        available: false,
        change_id: id()
      },
      6: {
        id: 6,
        available: false,
        change_id: id()
      },
      7: {
        id: 7,
        available: false,
        change_id: id()
      },
      8: {
        id: 8,
        available: false,
        change_id: id()
      },
      9: {
        id: 9,
        available: false,
        change_id: id()
      },
      10: {
        id: 10,
        available: false,
        change_id: id()
      },
      11: {
        id: 11,
        available: false,
        change_id: id()
      },
      12: {
        id: 12,
        available: false,
        change_id: id()
      },
      13: {
        id: 13,
        available: false,
        change_id: id()
      },
      14: {
        id: 14,
        available: false,
        change_id: id()
      },
    }
  },
  initial: 'setup',
  states: {
    setup: {
      entry: [
        'start_setup_service'
      ],
      on: {
        SETUP_GAME: {
          actions: ['forward_to_setup_service']
        },
        SETUP_DONE: {
          target: 'work',
          actions: ['setup_done']
        }
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
          {target: 'harvest'}
        ]
      },
    },
    harvest: {
      invoke: {
        id: 'harvest-service',
        src: 'harvest',
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
  type: 'SETUP_GAME',
  tasks_order: [
    ...shuffle([1, 2, 3, 4]),
    ...shuffle([5, 6, 7]),
    ...shuffle([8, 9]),
    ...shuffle([10, 11]),
    ...shuffle([12, 13]),
    14
  ]
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
