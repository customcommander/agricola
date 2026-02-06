// Plow fields

export default {
  selected: {
    // TODO: Should return an error code when not enough space
    check: (_, game) => {
      const spaces = Object.values(game.farmyard);
      return spaces.some(space => space == null);
    },

    select: (_, game) => {
      let spaces;
      spaces = Object.entries(game.farmyard);
      spaces = spaces.filter(([_, sp]) => sp == null);
      game.selection = spaces.map(([space_id]) => ({
        type: 'select.plow',
        task_id: '104',
        space_id
      }));
      return game;
    },

    execute: ({ event: { space_id } }, game) => {
      game.farmyard[space_id] = { type: 'field' };
      return game;
    }
  }
};

