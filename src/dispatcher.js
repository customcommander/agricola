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
  actions: {
    start:
    assign(({event: {tasks, details}}) => ({
      i: 0,
      j: 0,
      tasks,
      events: details
    })),

    dispatch:
    enqueueActions(({enqueue, context, system}) => {
      const {i, j} = context;
      const num_tasks = context.tasks.length;
      const id = context.tasks[i];
      const ev = context.events[j];

      enqueue.sendTo(system.get(`task-${id}`), ev);

      const next_cycle = i + 1 == num_tasks;

      enqueue.assign({
        i: (next_cycle ? 0 : i + 1), 
        j: (next_cycle ? j + 1 : j)
      });
    }),

    quit:
    sendTo(({system}) => system.get('gamesys'), {
      type: 'dispatch.done'
    })
  },

  guards: {
    'repeat?':
    ({context: {j, events}}) => j < events.length    
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
