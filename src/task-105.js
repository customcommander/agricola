/*

Implements the `1 Occupation` action space.

*/

import {base} from './task-lib.js';

export default base.createMachine({
  context: {
    /*

      How many times has an occupation card been played?

      We need to record this as the first one is free,
      all others cost 1 food.

      We could just have a boolean here but a precise
      number of occupations might come in handy.

     */
    count: 0
  },

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
                food: 1
              }
            }
          },
          {
            actions: {
              type: 'abort',
              params: {
                task_id: 105,
                err: 'NOT_ENOUGH_RESOURCES'
              }
            }
          }
        ]
      }
    },

    work: {
      entry: {
        type: 'abort',
        params: {
          task_id: 105,
          err: 'TODO'
        }
      }
    }

  }
});

