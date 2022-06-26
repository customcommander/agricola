const { setWorldConstructor, World } = require('@cucumber/cucumber');
const {interpret} = require('xstate');
const getMachine = require('../src/machines/main');

setWorldConstructor(class extends World {
  machine = null;

  constructor(options) {
    super(options);
    this.machine = getMachine();
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

  assertActionStock(action, stock) {
    const {context} = this.service.getSnapshot();
    let actual;
    let expected;
    if (action == 'Take X Wood') {
      actual = context.taskTakeXWood.wood;
      expected = parseInt(stock);
    }
    if (actual == expected) return;
    throw new Error(`Expected '${action}' to have ${stock} but got ${actual}`);
  }

  assertIsEndOfGame() {
    const state = this.service.getSnapshot();
    if (state.matches('end')) return;
    throw new Error(`The game has not ended yet (${state.value}).`);
  }
});
