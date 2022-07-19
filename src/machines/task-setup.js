const {assign} = require('@xstate/immer');

const task = {
  'take-x-wood': ctx => {
    ctx.task['take-x-wood'].wood += 2;
    ctx.task['take-x-wood'].available = true;
  },
  'take-x-clay': ctx => {
    ctx.task['take-x-clay'].clay += 1;
    ctx.task['take-x-clay'].available = true;
  },
  'take-x-reed': ctx => {
    ctx.task['take-x-reed'].reed += 1;
    ctx.task['take-x-reed'].available = true;
  },
  take_grain: ctx => {
    ctx.task.take_grain.available = true;
  },
  plow_field: ctx => {
    ctx.task.plow_field.available = true;
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
    task.take_grain(ctx);
    task.plow_field(ctx);
  }
});
