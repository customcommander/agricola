const { createMachine } = require("xstate");
const { sendParent } = require("xstate/lib/actions");

module.exports = () => createMachine({
  id: 'task-machine',
  initial: 'init',
  states: {
    init: {
      on: {
        START: {
          target: 'done',
          actions: sendParent('TASK_COMPLETED')
        }
      }
    },
    done: {
      type: 'final',
    }
  }
});
