import {base} from './task-lib.js';

function collect(_, game_context) {
  game_context.supply.grain += 1;
  return game_context;
}

export default base.createMachine({
  on: {
    'task.selected': {
      actions: [
        {type: 'game-update', params: {updater: collect}},
        {type: 'task-complete'}
      ]
    }
  }
});

