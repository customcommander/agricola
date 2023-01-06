import { setWorldConstructor, World } from '@cucumber/cucumber';
import {waitFor} from 'xstate/lib/waitFor.js';
import main from '../../src/engine/main.js';
import turn from '../../src/engine/observables/turn.js';

setWorldConstructor(class extends World {

  constructor(options) {
    super(options);
    const [game, start] = main();
    this.game = game;
    this.start = start;
    this.turn$ = turn(game);
  }

  startGame() {
    this.start(this.parameters.events);
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
    this.game.send({type: 'HARVEST_FIELDS_DONE'});
    this.game.send({type: 'HARVEST_FEED_DONE'});
    this.game.send({type: 'HARVEST_BREED_DONE'});
  }

  async assertIsHarvestTime() {
    await waitFor(this.game, st => st.matches('harvest.main'));
  }

  async assertIsEndOfGame() {
    await waitFor(this.game, st => st.matches('end_of_game'));
  }
});
