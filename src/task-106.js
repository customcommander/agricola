/*
  Day Laborer
*/

import task from './lib-task2.js';

export default task({
  id: '106',
  selected: (_, game) => {
    game.supply.food += 2;
    return game;
  }
});

