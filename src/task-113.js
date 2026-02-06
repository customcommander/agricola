/*

Sow and/or Bake bread

*/

export default {
  selected: {
    repeat: true,

    check: (_, game) => {
      const { supply: { grain, vegetable }, farmyard } = game;

      if (!grain && !vegetable) {
        return 'NOTHING_TO_SOW';
      }

      const spaces = Object.values(farmyard);

      const has_empty_fields = spaces.some(space => {
        const { type, grain, vegetable } = space ?? {};
        return type == 'field' && !grain && !vegetable
      });

      // TODO: specific error code
      if (!has_empty_fields) return false;

      return true;
    },

    select: ({task_id}, game) => {
      const spaces = Object.entries(game.farmyard);
      const opts = [];

      if (game.supply.grain) opts.push('select.sow-grain');
      if (game.supply.vegetable) opts.push('select.sow-vegetable');

      game.selection = spaces.flatMap(([space_id, space]) => {
        const { type, grain, vegetable } = space ?? {};
        const exit = type != 'field' || (grain || vegetable);
        return exit ? [] : opts.map(type => ({ type, task_id, space_id }));
      });

      return game;
    },

    execute: ({ event }, game) => {
      const { type, space_id } = event;

      if (type == 'select.sow-grain') {
        game.supply.grain -= 1;
        game.farmyard[space_id].grain = 3;
      }

      if (type == 'select.sow-vegetable') {
        game.supply.vegetable -= 1;
        game.farmyard[space_id].vegetable = 2;
      }

      return game;
    }
  }
};

