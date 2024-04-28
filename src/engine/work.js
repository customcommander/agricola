import {
  assign,
  createActor,
  log,
  setup,
} from 'xstate';

const src = {
  actions: {
    select_task_log: log(({context}) => `workers: ${context.workers}`),
    allocate_worker: assign({
      workers: ({context}) => context.workers - 1
    })
  },
  guards: {
    has_workers_left: ({context}) => context.workers > 0
  }
};

export default setup(src).createMachine({
  context: ({input}) => ({
    workers: input.workers
  }),
  initial: 'select_task',
  states: {
    select_task: {
      after: {
        500: {
          target: 'perform_task',
          actions: ['select_task_log', 'allocate_worker']
        }
      }
    },
    perform_task: {
      after: {
        500: [
          { target: 'select_task', guard: 'has_workers_left' },
          { target: 'done' }
        ]
      }
    },
    done: {
      type: 'final',
    }
  }
});

