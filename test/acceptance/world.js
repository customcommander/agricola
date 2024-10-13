import {World, setWorldConstructor} from '@cucumber/cucumber';
import {waitFor} from 'xstate';
import game from '../../src/game.js';

setWorldConstructor(class extends World {

  constructor(options) {
    super(options);
  }

  async start() {
    this.game = game();
    this.game.start();
    await this.wait(250);
  }

  async send(ev) {
    await this.wait(250);
    this.game.send(ev);
  }

  async wait(predicate) {
    if (typeof predicate == 'number') {
      await new Promise(res => setTimeout(res, predicate));
    }
    else {
      await waitFor(this.game, predicate);
    }
  }

  async assert(predicate) {
    await waitFor(this.game, ({context}) => predicate(context), {timeout: 2000});
  }
});

