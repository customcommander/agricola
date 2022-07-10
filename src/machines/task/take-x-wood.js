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

module.exports.onNewTurn = gameContext => [
  {op: 'replace', path: `/task/${id}/wood`, value: gameContext.task[id].wood + 2},
  {op: 'replace', path: `/task/${id}/selected`, value: false}
];

module.exports.onTaskCompleted = gameContext => [
  {op: 'replace', path: '/reserve/wood', value: gameContext.reserve.wood + gameContext.task[id].wood}
];
