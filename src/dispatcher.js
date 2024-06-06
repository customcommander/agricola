/*
  Dispatch events to tasks.
*/

import {
  assign,
  enqueueActions,
  sendTo,
  setup
} from 'xstate';

const src = setup({
  context: {
    jobs: []
  },
  actions: {
    start:
    assign(({event: {jobs}}) => ({jobs})),

    dispatch:
    enqueueActions(({enqueue, context, system}) => {
      const [{ev: type, task_id}, ...jobs] = context.jobs;
      enqueue.sendTo(system.get(`task-${task_id}`), {type});
      enqueue.assign({jobs});
    }),

    quit:
    sendTo(({system}) => system.get('gamesys'), {
      type: 'dispatch.done'
    })
  },

  guards: {
    'repeat?':
    ({context: {jobs}}) => jobs.length > 0
  }
});

export default src.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        dispatch: {
          target: 'loop',
          actions: 'start'
        }
      }
    },
    loop: {
      entry: 'dispatch',
      on: {
        'task.ack': [
          {target: 'loop', guard: 'repeat?', reenter: true},
          {target: 'idle', actions: 'quit'}
        ]
      }
    }
  }
});
