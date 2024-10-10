/*

Take x Reed

*/

import task from './lib-task.js';

export default task({
  id: '109',
  replenish: (_, game) => {
    game.tasks[109].quantity += 1;
    return game;
  },
  execute: (_, game) => {
    const {quantity} = game.tasks[109];
    game.supply.reed += quantity;
    game.tasks[109].quantity = 0;
    return game;
  }
});

