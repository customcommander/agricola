import {enqueueActions, or} from 'xstate';

import setup from './task-collect.js';

/*
{
  actions: {
    reset:
    ack((_, game_context) => {
      game_context.tasks['101'].selected = false;
      return game_context;
    }),

    replenish:
    ack(),

    abort:
    abort(101, 'NOT_ENOUGH_RESOURCES'),

    'display-selection':
    game_update((_, game_context) => {
      const caps = capabilities(game_context);
      const spaces = Object.entries(game_context.farmyard);

      game_context.selection =
        spaces.flatMap(([id, sp]) =>
          sp != null
            ? []
            : ({task_id: 101,
                space_id: id,
               ...caps}));

      return game_context;
    }),

    build:
    game_update(({event}, game_context) => {
      const {space_id} = event;
      } else {
        // throw?
      }
      game_context.selection = null;
      return game_context;
    }),

    'allow-early-exit':
    early_exit(101),

    done:
    complete(game_context => {
      game_context.early_exit = null; // TODO: the game engine should handle this
      game_context.selection = null;
      return game_context;
    }),
  },

  guards: {
    'enough-resources?':
    ({event: {game_context}}) => {
      const caps = capabilities(game_context);
      return caps != null;
    },
  }
}
*/

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

const machine = setup.createMachine({
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
        'space.selected': {
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
        params: ({event: {space_id, opt}}) => ({
          space_id,
          reply_to: 101,
          updater: ( opt ===  'wooden-hut' ? build_wooden_hut
                   : opt ===    'clay-hut' ? build_clay_hut
                   : opt === 'stone-house' ? build_stone_house
                   : opt ===      'stable' ? build_stable
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
      const opts =
        ( check( 'can-build-wooden-hut?') ? ['wooden-hut' , 'stable']
        : check(   'can-build-clay-hut?') ? ['clay-hut'   , 'stable']
        : check('can-build-stone-house?') ? ['stone-house', 'stable']
                                          : ['stable'               ]);

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

