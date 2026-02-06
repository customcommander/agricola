/*
  Day Laborer
*/

export default {
  selected: (_, game) => {
    game.supply.food += 2;
    return game;
  }
};

