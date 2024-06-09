/*

  Sow and/or Bake bread

*/

import {base} from './task-lib.js';

const machine = base.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.selected': [
          {
            target: 'work',
            guard: {
              type: 'enough-supply?',
              params: {
                grain: 1
              }
            }
          },
          {
            actions: {
              type: 'abort',
              params: {
                task_id: 113,
                err: 'NOT_ENOUGH_RESOURCES'
              }
            }
          }
        ]
      }
    },
    work: {
    }
  }
});

export default machine;

