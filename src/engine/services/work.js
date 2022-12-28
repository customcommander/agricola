import {assign, createMachine, forwardTo, sendParent, spawn} from 'xstate';
import {assign as i_assign} from '@xstate/immer';

const machine = ({num_workers}) => createMachine({
  id: 'work-service',
  context: {
    num_workers
  },
  initial: 'init',
  states: {
    init: {
      entry: ['notify_ready'],
      always: {
        target: 'select'
      }
    },
    select: {
      on: {
        TASK_SELECTED: {
          target: 'perform',
          actions: ['less_workers']
        }
      }
    },
    perform: {
      on: {
        TASK_CANCELLED: {
          target: 'select',
          actions: ['more_workers']
        },
        TASK_DONE: [
          {target: 'select', cond: 'workers_left'},
          {target: 'done'}
        ]
      }
    },
    done: {
      type: 'final',
      entry: ['notify_done']
    }
  }
}, {
  actions: {
    notify_ready: sendParent({type: 'WORK_SERVICE_READY'}),
    notify_done: sendParent({type: 'WORK_DONE'}),
    less_workers: i_assign(ctx => ctx.num_workers -= 1),
    more_workers: i_assign(ctx => ctx.num_workers += 1)
  },
  guards: {
    workers_left: ctx => ctx.num_workers > 0
  }
});

export const start_work_service = assign({
  WorkService: ({num_workers}) => spawn(machine({num_workers}))
});

export const forward_to_work_service = forwardTo(ctx => ctx.WorkService);
