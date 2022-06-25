const {Before} = require('@cucumber/cucumber');
const {createMachine} = require('xstate');

Before({tags: "@taskMachine1"}, function () {
  this.machine = this.machine.withConfig({
    services: {
      taskMachine: () => createMachine({
        initial: 'noop',
        states: {
          noop: {
            type: 'final'
          }
        }
      })
    }
  });
});

Before({tags: "@harvestMachine1"}, function () {
  this.machine = this.machine.withConfig({
    services: {
      harvestMachine: () => createMachine({
        initial: 'noop',
        states: {
          noop: {
            type: 'final'
          }
        }
      })
    }
  });
});