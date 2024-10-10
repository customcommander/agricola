import task from './lib-task.js';

export default task({
  id: '104',

  check: (_, game) => {
    const spaces = Object.values(game.farmyard);
    return spaces.some(space => space == null);
  },

  selection: (_, game) => {
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

  execute: ({event: {space_id}}, game) => {
    game.farmyard[space_id] = {type: 'field'};
    return game;
  }
});

