/*
  Day Laborer
*/

import {base} from './task-lib.js';

function collect(_, game_context) {
  game_context.supply.food += 2;
  return game_context;
}

export default base.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.selected': {
          actions: [
            {type: 'game-update', params: {updater: collect}},
            {type: 'task-complete'}
          ]
        }
      }
    }
  }
});

