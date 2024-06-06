import setup from './task-collect.js';

export default setup.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.replenish': {
          actions: 'ack'
        },
        'task.selected': {
          target: 'select-space'
        }
      }
    },
    'select-space': {
      entry: {
        type: 'display-selection',
        params: {
          task_id: 104,
          opts: ['plow']
        }
      },
      on: {
        'space.selected': {
          target: 'work'
        }
      }
    },
    work: {
      entry: {
        type: 'build',
        params: ({event}) => ({
          space_id: event.space_id,
          build: 'plow'
        })
      },
      always: {
        target: 'idle',
        actions: [
          'clear-selection',
          'task-complete'
        ]
      }
    }
  },
});
