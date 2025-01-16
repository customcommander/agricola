import task from './lib-task2.js';

export default task({
  id: '107',
  replenish: (_, game) => {
    game.tasks['107'].quantity += 2;
    return game;
  },
  selected: (_, game) => {
    const {quantity} = game.tasks['107'];
    game.supply.wood += quantity;
    game.tasks['107'].quantity = 0;
    return game;
  }
});

