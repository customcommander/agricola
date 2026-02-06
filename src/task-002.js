/*

Feeding phase

*/

export default {
  feed: (_, game) => {
    // TODO: work out new born!
    const {family} = game;
    game.supply.food -= family * 3;
    return game;
  }
};

