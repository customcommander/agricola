/*
@fileoverview
Take x CLay
*/

export default {

  replenish: ({task_id}, game) => {
    game.tasks[task_id].quantity += 1;
    return game;
  },

  selected: ({task_id}, game) => {
    const {quantity} = game.tasks[task_id];
    game.supply.clay += quantity;
    game.tasks[task_id].quantity = 0;
    return game;
  }
};

