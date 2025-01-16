/*

  Take x Stone

*/

import task from './lib-task2.js';

export default task({
  id: '116',

  replenish: (_, game) => {
    game.tasks['116'].quantity += 1;
    return game;
  },

  selected: (_, game) => {
    const {quantity} = game.tasks['116'];
    game.tasks['116'].quantity = 0;
    game.supply.stone += quantity;
    return game;
  }
});

