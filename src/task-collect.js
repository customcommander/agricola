import {fromCallback, assign} from 'xstate';

export const collect = fromCallback(({sendBack, input}) => {
  const {task_id} = input;
  sendBack({type: 'task.collect.done', task_id});
  sendBack({type: 'task.completed', task_id});
});

export const task_collect_done = assign(({context, event}) => {
  const {task_id} = event;
  const {quantity} = context.tasks.find(t => t.id == task_id);

  const supply_key = ({
    101: 'wood',
    102: 'clay',
    103: 'reed'
  })[task_id];

  return {
    supply: {
      ...context.supply,
      [supply_key]: context.supply[supply_key] + quantity
    },
    tasks: context.tasks.map(t => t.id != task_id ? t : {...t, quantity: 0})
  };
});

