import {assign, enqueueActions, sendTo} from 'xstate';
import {produce} from 'immer';
import * as collect from './task-collect.js';
import * as plow from './task-plow.js';

const taskm =
  {104: plow,
   107: collect,
   108: collect,
   109: collect};

export const task_start = enqueueActions(({enqueue, context, event, self}) => {
  const {task_id} = event;
  const spawn_id = `task-${task_id}-ref`;

  enqueue.assign(({context}) => produce(context, draft => {
    draft.workers -= 1;
    draft.tasks[task_id].selected = true;
    return draft;
  }));

  enqueue.assign({
    [spawn_id]: ({spawn}) => {
      const task = taskm[task_id];

      return spawn(task.actor, {
        input: {
          ...task.input(context),
          parent: self,
          task_id
        }
      });
    }
  });
});

export const task_stop = enqueueActions(({enqueue, event, context}) => {
  const {task_id} = event;
  const spawn_id = `task-${task_id}-ref`;

  enqueue.stopChild(spawn_id);

  enqueue.assign(() => produce(context, draft => {
    delete draft[spawn_id];
    draft.tasks[task_id].done = true;
    return draft;
  }));
});

