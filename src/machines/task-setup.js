const {assign} = require('@xstate/immer');

const task = {
  'take-x-wood': ctx => {
    ctx.task['take-x-wood'].wood += 2;
    ctx.task['take-x-wood'].selected = false;
  },
  'take-x-clay': ctx => {
    ctx.task['take-x-clay'].clay += 1;
    ctx.task['take-x-clay'].selected = false;
  },
  'take-x-reed': ctx => {
    ctx.task['take-x-reed'].reed += 1;
    ctx.task['take-x-reed'].selected = false;
  }
};

module.exports = assign((ctx, ev) => {
  const {turn, numWorkers, numWorkersRemaining} = ctx;

  const isNewTurn = numWorkersRemaining == 0;

  ctx.turn = isNewTurn ? turn + 1 : turn;
  ctx.numWorkersRemaining = isNewTurn ? numWorkers - 1 : numWorkersRemaining - 1;

  if (isNewTurn) {
    task['take-x-wood'](ctx);
    task['take-x-clay'](ctx);
    task['take-x-reed'](ctx);
  }
});
