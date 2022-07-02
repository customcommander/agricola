const { createMachine } = require("xstate");

module.exports = () => createMachine({
  id: 'task-machine',
  initial: 'done',
  states: {
    done: {
      type: 'final'
    }
  }
});
