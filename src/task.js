import {assign, enqueueActions, sendTo} from 'xstate';
import {produce} from 'immer';

import * as t101 from './task-101.js'
import * as collect from './task-collect.js';
import * as plow from './task-plow.js';

const taskm =
  {101: t101,
   104: plow,
   107: collect,
   108: collect,
   109: collect};

export const task_start = enqueueActions(({enqueue, context, event}) => {
  const {task_id} = event;
  const task = taskm[task_id];

  const err = task.abort(context);

  if (err) {
    enqueue.raise({type: 'task.aborted', error: err});
    return;
  }

  enqueue.assign(({context, event}) => produce(context, draft => {
    const {task_id} = event;

    draft.workers -= 1;
    draft.tasks[task_id].selected = true;

    return draft;
  }));

  enqueue.assign(({context, event, spawn, self}) => produce(context, draft => {
    const {task_id} = event;
    const task = taskm[task_id];
    const spawn_id = `task-${task_id}-ref`;

    draft[spawn_id] = spawn(task.actor, {
      input: {
        ...context,
        parent: self,
        task_id
      }
    });

    return draft;
  }));
});


export const task_stop = enqueueActions(({enqueue, event, context}) => {
  const {task_id} = event;
  const spawn_id = `task-${task_id}-ref`;

  enqueue.stopChild(spawn_id);

  enqueue.assign(({context}) => produce(context, draft => {
    const {task_id} = event;
    const spawn_id = `task-${task_id}-ref`;

    draft[spawn_id] = undefined;
    draft.tasks[task_id].done = true;

    return draft;
  }));
});

export const task_aborted = assign({
  error: ({event: {error}}) => error
});

