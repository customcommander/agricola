function can_build_stable(game) {
  const {supply: {wood}} = game;
  return wood >= 2;
}

function can_build_wooden_hut(game) {
  const {house_type, supply: {reed, wood}} = game;
  return house_type == 'wooden-hut' && reed >= 2 && wood >= 5;
}

function can_build_clay_hut(game) {
  const {house_type, supply: {reed, clay}} = game;
  return house_type == 'clay-hut' && reed >= 2 && clay >= 5;
}

function can_build_stone_house(game) {
  const {house_type, supply: {reed, stone}} = game;
  return house_type == 'stone-house' && reed >= 2 && stone >= 5;
}

export default {
  selected: {
    repeat: true,

    check: (_, game) => {
      const verify = (
         can_build_stable(game)
      || can_build_wooden_hut(game)
      || can_build_clay_hut(game)
      || can_build_stone_house(game)
      );
      return verify || 'NOT_ENOUGH_RESOURCES';
    },

    select: ({task_id}, game) => {
      const spaces = Object.entries(game.farmyard);
      const opts = [];

      if (can_build_stable(game)) opts.push('select.stable');
      if (can_build_wooden_hut(game)) opts.push('select.wooden-hut');
      if (can_build_clay_hut(game)) opts.push('select.clay-hut');
      if (can_build_stone_house(game)) opts.push('select.stone-house');

      game.selection = spaces.flatMap(([space_id, space]) =>
        space != null ? [] : opts.map(type => ({ type, space_id, task_id })));

      return game;
    },

    execute: ({ event: { type, space_id } }, game) => {
      if (type == 'select.stable') {
        game.supply.wood -= 2;
        game.farmyard[space_id] = { type: 'stable' };
      }
      else if (type == 'select.wooden-hut') {
        game.supply.wood -= 5;
        game.supply.reed -= 2;
        game.farmyard[space_id] = { type: 'wooden-hut' };
      }
      else if (type == 'select.clay-hut') {
        game.supply.clay -= 5;
        game.supply.reed -= 2;
        game.farmyard[space_id] = { type: 'clay-hut' };
      }
      else if (type == 'select.stone-house') {
        game.supply.stone -= 5;
        game.supply.reed -= 2;
        game.farmyard[space_id] = { type: 'stone-house' };
      }

      return game;
    }
  }
}

