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

module.exports.onNewTurn = gameContext => [
  {op: 'replace', path: `/task/${id}/reed`, value: gameContext.task[id].reed + 1},
  {op: 'replace', path: `/task/${id}/selected`, value: false}
];

module.exports.onTaskCompleted = gameContext => [
  {op: 'replace', path: '/reserve/reed', value: gameContext.reserve.reed + gameContext.task[id].reed}
];
