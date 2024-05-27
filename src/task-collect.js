import {
  setup,
} from 'xstate';

import {
  ack,
  complete
} from './task-lib.js';

export default setup({
  actions: {
    reset:
    ack(({context}, draft) => {
      const {task_id} = context;
      draft.tasks[task_id].selected = false;
      return draft;
    }),

    replenish:
    ack(({context}, draft) => {
      const {task_id, inc} = context;
      draft.tasks[task_id].quantity += inc;
      return draft;
    }),

    collect:
    complete(({context}, draft) => {
      const {task_id, supply} = context;
      const {quantity} = draft.tasks[task_id];
      draft.supply[supply] += quantity;
      draft.tasks[task_id].quantity = 0;
      return draft;
    })
  }
});

