/*
  Family growth
*/

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
              task_id: 115,
              err: 'TODO'
            }
          }
        }
      }
    }
  }
});

