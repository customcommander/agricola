/*
  Day Laborer
*/

import task from './lib-task.js';

export default task({
  id: '106',
  execute: (_, game) => {
    game.supply.food += 2;
    return game;
  }
});

