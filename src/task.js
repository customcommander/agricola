import {assign, enqueueActions, sendTo} from 'xstate';
import {produce} from 'immer';
import * as collect from './task-collect.js';
import * as plow from './task-plow.js';

const taskm =
  {104: plow,
   107: collect,
   108: collect,
   109: collect};

export const task_start = assign(({context, event, spawn, self}) => produce(context, draft => {
  const {task_id} = event;
  const task = taskm[task_id];
  const spawn_id = `task-${task_id}-ref`;

  draft.workers -= 1;
  draft.tasks[task_id].selected = true;

  draft[spawn_id] = spawn(task.actor, {
    input: {
      ...task.input(context),
      parent: self,
      task_id
    }
  });

  return draft;
}));

export const task_stop = enqueueActions(({enqueue, event, context}) => {
  const {task_id} = event;
  const spawn_id = `task-${task_id}-ref`;

  enqueue.stopChild(spawn_id);

  enqueue.assign(() => produce(context, draft => {
    draft[spawn_id] = undefined;
    draft.tasks[task_id].done = true;
    return draft;
  }));
});

