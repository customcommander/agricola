const {assign} = require('@xstate/immer');

const task = {
  'take-x-wood': ctx => {
    ctx.reserve.wood += ctx.task['take-x-wood'].wood;
    ctx.task['take-x-wood'].wood = 0;
    ctx.task['take-x-wood'].available = false;
  },
  'take-x-clay': ctx => {
    ctx.reserve.clay += ctx.task['take-x-clay'].clay;
    ctx.task['take-x-clay'].clay = 0;
    ctx.task['take-x-clay'].available = false;
  },
  'take-x-reed': ctx => {
    ctx.reserve.reed += ctx.task['take-x-reed'].reed;
    ctx.task['take-x-reed'].reed = 0;
    ctx.task['take-x-reed'].available = false;
  },
  take_grain: ctx => {
    ctx.reserve.grain += 1;
    ctx.task.take_grain.available = false;
  },
  plow_field: (ctx, ev) => {
    ctx.task.plow_field.available = false;
    ev.spaces.forEach(sp => ctx.spaces[sp].type = 'field');
  }
};

module.exports = assign((ctx, ev) => {
  if (ev.type == 'TASK_COMPLETED') {
    task[ev.task](ctx, ev);
  } else {
    ctx.numWorkersRemaining += 1;
  }
});
