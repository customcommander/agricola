/*

  Sow and/or Bake bread

*/

import {and, or} from 'xstate';
import {base} from './task-lib.js';

const machine = base.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.selected': [
          {
            target: 'work',
            guard: and(['has-empty-fields?', or(['has-grain?',
                                                 'has-vegetable?'])]),
            actions: {
              type: 'abort',
              params: {
                task_id: 113,
                err: 'TODO'
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

