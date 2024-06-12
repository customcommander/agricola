import {enqueueActions, or} from 'xstate';

import {base} from './task-lib.js';

function build_stable({params: {space_id}}, game_context) {
  game_context.supply.wood -= 2;
  game_context.farmyard[space_id] = {type: 'stable'};
  return game_context;
}

function build_wooden_hut({params: {space_id}}, game_context) {
  game_context.supply.wood -= 5;
  game_context.supply.reed -= 2;
  game_context.farmyard[space_id] = {type: 'wooden-hut'};
  return game_context;
}

function build_clay_hut({params: {space_id}}, game_context) {
  game_context.supply.clay -= 5;
  game_context.supply.reed -= 2;
  game_context.farmyard[space_id] = {type: 'clay-hut'};
  return game_context;
}

function build_stone_house({params: {space_id}}, game_context) {
  game_context.supply.stone -= 5;
  game_context.supply.reed -= 2;
  game_context.farmyard[space_id] = {type: 'stone-house'};
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
            guard: or(['can-build-wooden-hut?',
                       'can-build-clay-hut?',
                       'can-build-stone-house?',
                       'can-build-stable?'])
          },
          {
            actions: {
              type: 'abort',
              params: {
                task_id: 101,
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
          actions: ['early-exit-stop',
                    'task-complete']
        }
      },
      exit: 'clear-selection'
    },
    work: {
      entry: {
        type: 'game-update',
        params: ({event: {type, space_id}}) => ({
          space_id,
          reply_to: 101,
          updater: ( type === 'select.wooden-hut'  ? build_wooden_hut
                   : type === 'select.clay-hut'    ? build_clay_hut
                   : type === 'select.stone-house' ? build_stone_house
                   : type === 'select.stable'      ? build_stable
                                                   : null /* throw? */)
        })
      },
      on: {
        'game.updated': [
          {
            target: 'select-space',
            guard: or(['can-build-wooden-hut?',
                       'can-build-clay-hut?',
                       'can-build-stone-house?',
                       'can-build-stable?']),
            actions: {
              type: 'early-exit-init',
              params: {
                task_id: 101
              }
            }
          },
          {
            target: 'idle',
            actions: ['early-exit-stop',
                      'task-complete']
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
      if (check('can-build-stable?'))      opts.push('select.stable');
      if (check('can-build-wooden-hut?'))  opts.push('select.wooden-hut');
      if (check('can-build-clay-hut?'))    opts.push('select.clay-hut');
      if (check('can-build-stone-house?')) opts.push('select.stone-house');
      enqueue({type: 'display-selection', params: {task_id: 101, opts}});
    })
  },
  guards: {
    'can-build-stable?':
    ({event: {game_context}}) => {
      const {supply: {wood}} = game_context;
      return wood >= 2;
    },

    'can-build-wooden-hut?':
    ({event: {game_context}}) => {
      const {house_type, supply: {reed, wood}} = game_context;
      return house_type == 'wooden-hut' && reed >= 2 && wood >= 5;
    },

    'can-build-clay-hut?':
    ({event: {game_context}}) => {
      const {house_type, supply: {reed, clay}} = game_context;
      return house_type == 'clay-hut' && reed >= 2 && clay >= 5;
    },

    'can-build-stone-house?':
    ({event: {game_context}}) => {
      const {house_type, supply: {reed, stone}} = game_context;
      return house_type == 'stone-house' && reed >= 2 && stone >= 5;
    }
  }
});

