const { createMachine } = require("xstate");
const { sendParent } = require("xstate/lib/actions");

const id = 'take-x-wood';

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
  gameContext.task[id].wood += 2;
  gameContext.task[id].selected = false;
}

module.exports.onTaskCompleted = gameContext => {
  gameContext.reserve.wood += gameContext.task[id].wood;
  gameContext.task[id].wood = 0;
  gameContext.task[id].selected = true;
};
