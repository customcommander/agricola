import {
  setup
} from 'xstate';

import {
  abort,
  ack,
} from './task-lib.js';

const src = setup({
  actions: {
    reset:
    ack((_, ctx) => {
      ctx.tasks['101'].selected = false;
      return ctx;
    }),

    replenish:
    ack(),

    abort:
    abort(101, 'NOT_ENOUGH_RESOURCES')
  }
});

export default src.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.reset': {
          actions: 'reset'
        },
        'task.replenish': {
          actions: 'replenish'
        },
        'task.selected': [
          {actions: 'abort'}
        ]
      }
    }
  }
});

