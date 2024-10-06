/*
  Dispatch events to tasks one by one,
  waiting for each task to acknowledge the
  event before dispatching to the next task.
*/

import {
  assign,
  enqueueActions,
  sendTo,
  setup
} from 'xstate';

const src = setup({
  actions: {
    dispatch: enqueueActions(({enqueue, context, system}) => {
      const [{ev: type, task_id}, ...jobs] = context.jobs;
      enqueue.sendTo(system.get(`task-${task_id}`), {type});
      enqueue.assign({jobs});
    })
  },

  guards: {
    'repeat?': ({context}) => {
      const {jobs} = context;
      return jobs.length > 0
    }
  }
});

export default src.createMachine({
  context: ({input}) => ({
    jobs: input.jobs
  }),
  initial: 'loop',
  states: {
    loop: {
      entry: 'dispatch',
      on: {
        'task.ack': [
          {target: 'loop', guard: 'repeat?', reenter: true},
          {target: 'done'}
        ]
      }
    },
    done: {
      type: 'final'
    }
  }
});
