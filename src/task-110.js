import setup from './task-collect.js';

export default setup.createMachine({
  context: {
    task_id: 110,
    supply: 'food',
    inc: 1
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

