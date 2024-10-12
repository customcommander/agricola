/*

  Take {qty} Wild Boar

*/

import task from './lib-task.js';

export default task({
  id: '119',

  replenish: (_, game) => {
    game.tasks['119'].quantity += 1;
    return game;
  },

  todo: true
});

