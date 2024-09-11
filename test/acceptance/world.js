import {World, setWorldConstructor} from '@cucumber/cucumber';
import {waitFor} from 'xstate';
import game from '../../src/game.js';

setWorldConstructor(class extends World {

  constructor(options) {
    super(options);
  }

  start() {
    this.game = game();
    this.game.start();
  }

  async assert(predicate) {
    await waitFor(this.game, ({context}) => predicate(context), {timeout: 2000});
  }
});

