import task from './lib-task.js';

export default task({
  id: '107',
  replenish: (_, game) => {
    game.tasks['107'].quantity += 2;
    return game;
  },
  execute: (_, game) => {
    const {quantity} = game.tasks['107'];
    game.supply.wood += quantity;
    game.tasks['107'].quantity = 0;
    return game;
  }
});

