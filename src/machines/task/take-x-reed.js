const { createMachine } = require("xstate");
const { sendParent } = require("xstate/lib/actions");

const id = 'take-x-reed';

module.exports = (gameContext) => createMachine({
  id,
  context: gameContext,
  initial: 'init',
  states: {
    init: {
      on: {
        START: {
          target: 'ask'
        }
      }
    },
    ask: {
      on: {
        CONFIRM: {
          target: 'done',
          actions: sendParent({type: 'TASK_COMPLETED', task: id})
        }
      }
    },
    done: {
      type: 'final'
    }
  }
});

module.exports.onNewTurn = gameContext => {
  gameContext.task[id].reed += 1;
  gameContext.task[id].selected = false;
};

module.exports.onTaskCompleted = gameContext => {
  gameContext.reserve.reed += gameContext.task[id].reed;
  gameContext.task[id].reed = 0;
  gameContext.task[id].selected = true;
};
