import task from './lib-task.js';

export default task({
  id: '103',
  execute: (_, game) => {
    game.supply.grain += 1;
    return game;
  }
});

