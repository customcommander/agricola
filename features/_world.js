const { setWorldConstructor, World } = require('@cucumber/cucumber');
const {interpret} = require('xstate');
const machine = require('../src/machines/main');

setWorldConstructor(class extends World {
  machine = null;

  constructor(options) {
    super(options);
    this.machine = machine;
  }

  start() {
    this.service = interpret(this.machine);
    this.service.start();
  }

  completeNTurn(n) {
    const numWorkers = this.machine.context.numWorkers;
    this.service.send(Array(n * numWorkers).fill(['TASK_SELECTED', 'TASK_COMPLETED']).flat(1));
  }

  completeHarvest() {
    this.service.send('HARVEST_COMPLETED');
  }

  assertIsHarvestTime() {
    const state = this.service.getSnapshot();
    if (state.matches('harvest')) return;
    throw new Error(`This is not harvest time (${state.value}).`);
  }

  assertIsEndOfGame() {
    const state = this.service.getSnapshot();
    if (state.matches('end')) return;
    throw new Error(`The game has not ended yet (${state.value}).`);
  }
});
