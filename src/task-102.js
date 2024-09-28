/*

  Starting Player
  and/or
  1 Minor Improvement

*/

import {
  base
} from './task-lib.js';

const machine = base.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.selected': {
          actions: {
            type: 'abort',
            params: {
              task_id: 102,
              err: 'TODO'
            }
          }
        }
      }
    }
  }
});

export default machine;

