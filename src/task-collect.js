import {fromCallback, assign} from 'xstate';
import {produce} from 'immer';

export const collect = fromCallback(({sendBack, input}) => {
  const {task_id} = input;
  sendBack({type: 'task.collect.done', task_id});
  sendBack({type: 'task.completed', task_id});
});

export const task_collect_done = assign(({context, event}) => produce(context, draft => {
  const {task_id} = event;
  const {quantity} = context.tasks[task_id];

  const supply_key = ({
    107: 'wood',
    108: 'clay',
    109: 'reed'
  })[task_id];

  draft.supply[supply_key] += quantity;
  draft.tasks[task_id].quantity = 0;
  return draft;
}));

