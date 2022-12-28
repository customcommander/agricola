import { setWorldConstructor, World } from '@cucumber/cucumber';
import main from '../../src/xstate/main.js';
import {waitFor} from 'xstate/lib/waitFor.js';

setWorldConstructor(class extends World {

  constructor(options) {
    super(options);
    const [game, start] = main();
    this.game = game;
    this.start = start;
  }

  start() {
    this.start();
  }

  async completeNTurn(n) {
    await waitFor(this.game, st => st.matches('work.main'));
    const {context} = this.game.getSnapshot();
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < context.num_workers; j++) {
        this.game.send({type: 'TASK_SELECTED'});
        this.game.send({type: 'TASK_DONE'});
      }
    }
  }

  completeHarvest() {
    this.game.send({type: 'HARVEST_FIELD'});
    this.game.send({type: 'HARVEST_FEED'});
    this.game.send({type: 'HARVEST_BREED'});
    this.game.send({type: 'HARVEST_DONE'});
  }

  async assertIsHarvestTime() {
    await waitFor(this.game, st => st.matches('harvest.main'));
  }

  async assertIsEndOfGame() {
    await waitFor(this.game, st => st.matches('end_of_game'));
  }
});
