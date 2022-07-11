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

module.exports.onNewTurn = gameContext => [
  {op: 'replace', path: `/task/${id}/clay`, value: gameContext.task[id].clay + 1},
  {op: 'replace', path: `/task/${id}/selected`, value: false}
];

module.exports.onTaskCompleted = gameContext => [
  {op: 'replace', path: `/task/${id}/clay`, value: 0},
  {op: 'replace', path: `/task/${id}/selected`, value: true},
  {op: 'replace', path: '/reserve/clay', value: gameContext.reserve.clay + gameContext.task[id].clay}
];
