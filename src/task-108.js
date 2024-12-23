/*
@fileoverview
Take x CLay
*/

import task from './lib-task.js';

export default task({
  id: '108',
  replenish: (_, game) => {
    game.tasks['108'].quantity += 1;
    return game;
  },
  execute: (_, game) => {
    const {quantity} = game.tasks['108'];
    game.supply.clay += quantity;
    game.tasks['108'].quantity = 0;
    return game;
  }
});

