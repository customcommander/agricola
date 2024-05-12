import {fromCallback, assign} from 'xstate';
import {produce} from 'immer';

const supply_key =
  {107: 'wood',
   108: 'clay',
   109: 'reed'};

export const collect = fromCallback(({sendBack, input}) => {
  const {task_id} = input;

  sendBack({
    type: 'game.update',
    from: {
      task_id,
    },
    produce: produce((draft, {task_id}) => {
      const {quantity} = draft.tasks[task_id];
      draft.supply[supply_key[task_id]] += quantity;
      draft.tasks[task_id].quantity = 0;
      return draft;
    })
  });

  sendBack({
    type: 'task.completed',
    task_id
  });
});

