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
    for (let i = 0; i < n; i++) {
      this.service.send({type: 'TASK_SELECTED', task: 'take-x-wood'});
      this.service.send({type: 'TASK_COMPLETED', task: 'take-x-wood'});
      this.service.send({type: 'TASK_SELECTED', task: 'take-x-clay'});
      this.service.send({type: 'TASK_COMPLETED', task: 'take-x-clay'});
    }
  }

  completeHarvest() {
    this.service.send('HARVEST_COMPLETED');
  }

  assertIsHarvestTime() {
    const state = this.service.getSnapshot();
    if (state.matches('harvest')) return;
    throw new Error(`This is not harvest time (${JSON.stringify(state.value, null, 2)}).`);
  }

  assertActionStock(action, stock) {
    const {context} = this.service.getSnapshot();
    let actual;
    let expected;
    if (action == 'Take X Wood') {
      actual = context.task['take-x-wood'].wood;
      expected = parseInt(stock);
    }
    if (action == 'Take X Clay') {
      actual = context.task['take-x-clay'].clay;
      expected = parseInt(stock);
    }
    if (action == 'Take X Reed') {
      actual = context.task['take-x-reed'].reed;
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

  assertReserve(material, expected) {
    const state = this.service.getSnapshot();
    const actual = state.context.reserve[material];
    if (actual == expected) return;
    throw new Error(`Expected ${expected} ${material} in the reserve but got ${actual} instead.`);
  }

  takeXWood() {
    this.service.send({type: 'TASK_SELECTED', task: 'take-x-wood'});
    this.service.send({type: 'TASK_COMPLETED', task: 'take-x-wood'});
  }

  takeXClay() {
    this.service.send({type: 'TASK_SELECTED', task: 'take-x-clay'});
    this.service.send({type: 'TASK_COMPLETED', task: 'take-x-clay'});
  }
});
