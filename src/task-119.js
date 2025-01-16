/*

  Take {qty} Wild Boar

*/

import task from './lib-task2.js';

export default task({
  id: '119',

  replenish: (_, game) => {
    game.tasks['119'].quantity += 1;
    return game;
  },

  selected: 'TODO'
});

