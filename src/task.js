import {assign, enqueueActions, sendTo} from 'xstate';
import {collect} from './task-collect.js';
import {plow} from './task-plow.js';

export const start_task = enqueueActions(({enqueue, context, event, self}) => {
  const {task_id} = event;
  const spawn_id = `task-${task_id}-ref`;

  enqueue.assign({
    workers: context.workers - 1,
    tasks: context.tasks.map(t => t.id != task_id ? t : {...t, selected: true})
  });

  enqueue.assign({
    [spawn_id]: ({spawn}) => {
      const is_collect = task_id == 101 || task_id == 102 || task_id == 103;
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

export const stop_task = enqueueActions(({enqueue, event, context}) => {
  const {task_id} = event;
  const spawn_id = `task-${task_id}-ref`;

  enqueue.stopChild(spawn_id);

  enqueue.assign({
    [spawn_id]: undefined,
    tasks: ({context}) => context.tasks.map(t => {
      if (t.id != task_id) return t;
      const update = {...t, done: true};
      return update;
    })
  });
});

