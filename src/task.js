import {assign, enqueueActions} from 'xstate';
import {collect} from './task-collect.js';

export const start_task = assign(({context, event, spawn}) => {
  const {task_id} = event;
  const spawn_id = `task-${task_id}-ref`;
  return {
    [spawn_id]: spawn(collect, {id: spawn_id, input: {task_id}}),
    workers: context.workers - 1,
    tasks: context.tasks.map(t => t.id != task_id ? t : {...t, selected: true})
  };
});

export const stop_task = enqueueActions(({enqueue, event, context}) => {
  const {task_id} = event;
  const spawn_id = `task-${task_id}-ref`;
  enqueue.stopChild(spawn_id);
  enqueue.assign({[spawn_id]: undefined});
});

