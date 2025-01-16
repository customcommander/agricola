/*

  Take x Stone

*/

import task from './lib-task2.js';

export default task({

  replenish: ({task_id}, game) => {
    game.tasks[task_id].quantity += 1;
    return game;
  },

  selected: ({task_id}, game) => {
    const {quantity} = game.tasks[task_id];
    game.tasks[task_id].quantity = 0;
    game.supply.stone += quantity;
    return game;
  }
});

