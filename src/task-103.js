// Take one grain
export default {
  selected: {
    execute: (_, game) => {
      game.supply.grain += 1;
      return game;
    }
  }
};

