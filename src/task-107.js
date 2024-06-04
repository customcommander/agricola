import setup from './task-collect.js';

export default setup.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.reset': {
          actions: {
            type: 'reset',
            params: {
              task_id: 107
            }
          }
        },
        'task.replenish': {
          actions: {
            type: 'replenish',
            params: {
              task_id: 107,
              inc: 2
            }
          }
        },
        'task.selected': {
          actions: {
            type: 'collect',
            params: {
              task_id: 107,
              supply: 'wood'
            }
          }
        }
      }
    }
  }
});

