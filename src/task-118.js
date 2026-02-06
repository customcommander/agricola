/*

  Take x Vegetable

*/

export default {
  selected: (_, game) => {
    game.supply.vegetable += 1;
    return game;
  }
};

