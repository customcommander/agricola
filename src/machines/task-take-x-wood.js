const { createMachine } = require("xstate");
const { sendParent } = require("xstate/lib/actions");

const generateUpdate = ctx => [
  { op: 'replace'
  , path: '/reserve/wood'
  , value: ctx.reserve.wood + ctx.takeXWood.wood }
];

module.exports = (gameContext) => createMachine({
  id: 'take-x-wood',
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
          actions: sendParent(ctx => ({
            type: 'TASK_COMPLETED',
            update: generateUpdate(ctx)
          }))
        }
      }
    },
    done: {
      type: 'final'
    }
  }
});

module.exports.generateUpdate = generateUpdate;
