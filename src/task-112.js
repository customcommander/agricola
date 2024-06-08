import {base} from './task-lib.js';

export default base.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.selected': {
          actions: {
            type: 'abort',
            params: {
              task_id: 112,
              err: 'TODO'
            }
          }
        }
      }
    }
  }
});
