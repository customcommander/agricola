import { setWorldConstructor, World } from '@cucumber/cucumber';
import {waitFor} from 'xstate/lib/waitFor.js';
import init_game from '../../src/engine/main.js';

setWorldConstructor(class extends World {

  constructor(options) {
    super(options);
    this.game = init_game();
  }

  startGame() {
    this.game.start();
  }

  completeNTurn(n) {
    for (let i = 0; i < n; i++) {
      this.game.send({type: 'WORK'});
      this.game.send({type: 'WORK_DONE'});
    }
  }

  async assertIsEndOfGame() {
    await waitFor(this.game, st => st.matches('end_of_game'));
  }
});
