import {interpret, createMachine} from 'xstate';
import shuffle from 'array-shuffle';

import * as actions from './actions/index.js';
import * as guards from './guards/index.js';
import * as services from './services/index.js';
import machineDef from './main.definition.js';

const machine = () =>
  createMachine(machineDef(), {actions, guards, services});

// TODO:
// Eventually this event will be responsible for:
//  1.  Selecting occupation cards
//  2.  Selecting minor improvement cards
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
