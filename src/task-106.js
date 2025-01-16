/*
  Day Laborer
*/

import task from './lib-task2.js';

export default task({

  selected: (_, game) => {
    game.supply.food += 2;
    return game;
  }
});

