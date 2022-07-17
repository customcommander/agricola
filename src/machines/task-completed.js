const {assign} = require('@xstate/immer');

const task = {
  'take-x-wood': ctx => {
    ctx.reserve.wood += ctx.task['take-x-wood'].wood;
    ctx.task['take-x-wood'].wood = 0;
    ctx.task['take-x-wood'].selected = true;
  },
  'take-x-clay': ctx => {
    ctx.reserve.clay += ctx.task['take-x-clay'].clay;
    ctx.task['take-x-clay'].clay = 0;
    ctx.task['take-x-clay'].selected = true;
  },
  'take-x-reed': ctx => {
    ctx.reserve.reed += ctx.task['take-x-reed'].reed;
    ctx.task['take-x-reed'].reed = 0;
    ctx.task['take-x-reed'].selected = true;
  },
  take_grain: ctx => {
    ctx.reserve.grain += 1;
    ctx.task.take_grain.selected = true;
  }
};

module.exports = assign((ctx, ev) => {
  if (ev.type == 'TASK_COMPLETED') {
    task[ev.task](ctx);
  }
});
