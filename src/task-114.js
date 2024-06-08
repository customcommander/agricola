/*

  Sow and/or Bake bread

*/

import {base} from './task-lib.js';

function replenish(_, game_context) {
  game_context.tasks[114].quantity += 1;
  return game_context;
}

export default base.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.replenish': {
          actions: [
            {type: 'game-update', params: {updater: replenish}},
            {type: 'ack'}
          ]
        },
        'task.selected': {
          actions: {
            type: 'abort',
            params: {
              task_id: 114,
              err: 'TODO'
            }
          }
        }
      }
    }
  }
});

