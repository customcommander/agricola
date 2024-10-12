/*

  Take x Vegetable

*/

import task from './lib-task.js';

export default task({
  id: '118',

  execute: (_, game) => {
    game.supply.vegetable += 1;
    return game;
  }
});

