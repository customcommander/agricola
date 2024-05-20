import {enqueueActions, createMachine} from 'xstate';
import {produce} from 'immer';

export const actor = createMachine({
  context: ({input}) => {
    const {parent, task_id} = input;
    const resource_id = ( task_id == 107 ? 'wood'
                        : task_id == 108 ? 'clay'
                        : task_id == 109 ? 'reed'
                                         : null);
    return {
      parent,
      task_id,
      resource_id
    }; 
  },
  initial: 'collect',
  states: {
    collect: {
      entry:
      enqueueActions(({enqueue, context}) => {
        enqueue.sendTo(context.parent, {
          type: 'game.update',
          from: {
            task_id: context.task_id,
            resource_id: context.resource_id
          },
          produce: produce((draft, {task_id, resource_id}) => {
            const {quantity} = draft.tasks[task_id];
            draft.supply[resource_id] += quantity;
            draft.tasks[task_id].quantity = 0;
            return draft;
          })
        });

        enqueue.sendTo(context.parent, {
          type: 'task.completed',
          task_id: context.task_id
        });
      })
    }
  }
});

export const abort = () => false;

