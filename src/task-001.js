/*

  Implements the field phase during harvesting.

*/

import task from './lib-task.js';

export default task({
  id: '001',

  fields: (_, game) => {
    const ids = Object.keys(game.farmyard);

    for (let id of ids) {
      if (game.farmyard[id]?.type != 'field') {
        continue;
      }

      if (game.farmyard[id].grain) {
        game.farmyard[id].grain -= 1;
        game.supply.grain += 1;
      }

      if (game.farmyard[id].vegetable) {
        game.farmyard[id].vegetable -= 1;
        game.supply.vegetable += 1;
      }
    }

    return game;
  }
});

