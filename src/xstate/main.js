import {interpret} from 'xstate';
import machine from './main-machine.js';

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
  const game = interpret(machine());
  game.start();
  game.send(events ?? [initGame()]);
  return game;
};
