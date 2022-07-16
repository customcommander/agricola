const { createMachine } = require("xstate");
const { sendParent } = require("xstate/lib/actions");

const id = 'take-x-clay';

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
  gameContext.task[id].clay += 1;
  gameContext.task[id].selected = false;
};

module.exports.onTaskCompleted = gameContext => {
  gameContext.reserve.clay += gameContext.task[id].clay;
  gameContext.task[id].clay = 0;
  gameContext.task[id].selected = true;
};
