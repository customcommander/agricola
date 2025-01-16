import task from './lib-task2.js';

export default task({

  replenish: ({task_id}, game) => {
    game.tasks[task_id].quantity += 2;
    return game;
  },

  selected: ({task_id}, game) => {
    const {quantity} = game.tasks[task_id];
    game.supply.wood += quantity;
    game.tasks[task_id].quantity = 0;
    return game;
  }
});

