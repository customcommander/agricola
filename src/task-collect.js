import {
  enqueueActions,
  sendTo,
  setup,
} from 'xstate';

import {
  produce
} from 'immer';


export default setup({
  actions: {
    reset:
    enqueueActions(({enqueue, context, system}) => {
      enqueue.sendTo(system.get('gamesys'), {
        type: 'game.update',
        produce: produce(draft => {
          const {task_id} = context;
          draft.tasks[task_id].selected = false;
          return draft;
        })
      });

      enqueue.sendTo(system.get('dispatcher'), {
        type: 'task.ack'
      });
    }),

    replenish:
    enqueueActions(({enqueue, context, system}) => {
      enqueue.sendTo(system.get('gamesys'), {
        type: 'game.update',
        produce: produce(draft => {
          const {task_id, inc} = context;
          draft.tasks[task_id].quantity += inc;
          return draft;
        })
      });

      enqueue.sendTo(system.get('dispatcher'), {
        type: 'task.ack'
      });
    }),

    collect:
    enqueueActions(({enqueue, context, system}) => {
      const {task_id, supply} = context;
      
      // applies the effect of carrying out the task
      enqueue.sendTo(system.get('gamesys'), ({
        type: 'game.update',
        produce: produce(draft => {
          const {quantity} = draft.tasks[task_id];
          draft.supply[supply] += quantity;
          draft.tasks[task_id].quantity = 0;
          return draft;
        })
      }));

      enqueue.sendTo(system.get('gamesys'), ({
        type: 'task.completed'
      }));
    })
  }
});

