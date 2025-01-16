/*

  Sheep

*/

import task from './lib-task2.js';

export default task({
  id: '114',
  replenish: (_, game) => {
    game.tasks[114].quantity += 1;
    return game;
  },
  selected: 'TODO'
})


