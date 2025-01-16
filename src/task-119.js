/*

  Take {qty} Wild Boar

*/

import task from './lib-task2.js';

export default task({

  replenish: ({task_id}, game) => {
    game.tasks[task_id].quantity += 1;
    return game;
  },

  selected: 'TODO'
});

