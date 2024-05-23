import setup from './task-collect.js';

export default setup.createMachine({
  context: {
    task_id: 107,
    supply: 'wood',
    inc: 2
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.reset':     {actions: 'reset'},
        'task.replenish': {actions: 'replenish'},
        'task.selected':  {actions: 'collect'}
      }
    }
  }
});

