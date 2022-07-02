const { createMachine } = require("xstate");

module.exports = () => createMachine({
  id: 'harvest-machine',
  initial: 'done',
  states: {
    done: {
      type: 'final'
    }
  }
});
