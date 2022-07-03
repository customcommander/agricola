const { createMachine } = require("xstate");

module.exports = () => createMachine({
  id: 'task-machine',
  initial: 'init',
  states: {
    init: {
    },
    start: {
      type: 'final'
    }
  }
});
