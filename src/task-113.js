/*

  Sow and/or Bake bread

*/

import {and, or, enqueueActions} from 'xstate';
import {base} from './task-lib.js';

function sow_grain({params: {space_id}}, game_context) {
  game_context.supply.grain -= 1;
  game_context.farmyard[space_id].grain = 3;
  return game_context;
}

function sow_vegetable({params: {space_id}}, game_context) {
  game_context.supply.vegetable -= 1;
  game_context.farmyard[space_id].vegetable = 2;
  return game_context;
}

const machine = base.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.selected': [
          {
            target: 'select-space',
            guard: and(['has-empty-fields?', or(['has-grain?', 'has-vegetable?'])])
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
    'select-space': {
      entry: 'compute-&-display-selection',
      on: {
        'select.*': {
          target: 'work',
        },
        'task.exit': {
          target: 'idle',
          actions: ['early-exit-stop', 'task-complete']
        }
      },
      exit: 'clear-selection'
    },
    work: {
      entry: {
        type: 'game-update',
        params: ({event: {type, space_id}}) => ({
          space_id,
          reply_to: 113,
          updater: ( type === 'select.sow-grain'     ? sow_grain
                   : type === 'select.sow-vegetable' ? sow_vegetable
                                                     : null /* throw? */)
        })
      },
      on: {
        'game.updated': [
          {
            target: 'select-space',
            guard: and(['has-empty-fields?', or(['has-grain?', 'has-vegetable?'])]),
            actions: {
              type: 'early-exit-init',
              params: {
                task_id: 113
              }
            }
          },
          {
            target: 'idle',
            actions: ['early-exit-stop', 'task-complete']
          }
        ]
      }
    }
  }
});

export default machine.provide({
  actions: {
    'compute-&-display-selection':
    enqueueActions(({enqueue, check}) => {
      const opts = [];
      if (check('has-grain?'))     opts.push('select.sow-grain');
      if (check('has-vegetable?')) opts.push('select.sow-vegetable');
      enqueue({type: 'display-selection', params: {task_id: 113, opts}});
    })
  }
});

