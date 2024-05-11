import {assign, enqueueActions, sendTo} from 'xstate';
import {produce} from 'immer';
import {collect} from './task-collect.js';
import {plow} from './task-plow.js';

export const task_start = enqueueActions(({enqueue, event, self}) => {
  const {task_id} = event;
  const spawn_id = `task-${task_id}-ref`;

  enqueue.assign(({context}) => produce(context, draft => {
    draft.workers -= 1;
    draft.tasks[task_id].selected = true;
    return draft;
  }));

  enqueue.assign({
    [spawn_id]: ({spawn}) => {
      const is_collect = task_id == 107 || task_id == 108 || task_id == 109;
      if (is_collect) return spawn(collect, {input: {task_id}});

      const is_plow = task_id == 104;
      if (is_plow) {
        return spawn(plow, {
          input: {
            parent: self,
            count: 1
          }
        });
      }
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

