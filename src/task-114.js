/*

  Sheep

*/

import task from './lib-task.js';

export default task({
  id: '114',
  todo: true,
  replenish: (_, game) => {
    game.tasks[114].quantity += 1;
    return game;
  }
})


