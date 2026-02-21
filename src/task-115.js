/*

After Family growth,
also 1 Minor Improvement

*/

function count_housing_unit(game) {
  const spaces = Object.values(game.farmyard);
  return spaces.reduce((tot, space) => {
    return tot + Number(
      space?.type === 'wooden-hut' ||
      space?.type === 'clay-hut' ||
      space?.type === 'stone-house'
    );
  }, 0);
}

export default {
  selected: {

    check: (_, game) => {
      if (count_housing_unit(game) > game.family) {
        return true;
      }
      return 'NO_ROOMS_FOR_NEW_BORN';
    },

    execute: (_, game) => {
      game.family += 1;
      return game;
    }
  }
};

