/*

Fishing
Take x Food

*/
import task from './lib-task2.js';

export default task({
  id: '110',
  replenish: (_, game) => {
    game.tasks[110].quantity += 1;
    return game;
  },
  selected: (_, game) => {
    const {quantity} = game.tasks[110];
    game.supply.food += quantity;
    game.tasks[110].quantity = 0;
    return game;
  }
});

