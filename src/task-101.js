import {
  assign,
  enqueueActions,
  setup
} from 'xstate';

import {
  abort,
  ack,
  complete,
  early_exit,
  game_update,
  queue
} from './task-lib.js';

function merge(...xs) {
  const ys = xs.filter(x => x != null);
  return ys.length > 0 ? Object.assign(...ys) : null;
}

function when(pred, ret) {
  return pred ? ret : null;
}

function capabilities(game_context) {
  const {house_type} = game_context;
  const {reed, wood, clay, stone} = game_context.supply;

  return merge(
    when((wood >= 2),
         {'build-stable': true}),

    when((house_type == 'wooden_hut' && reed >= 2 && wood >= 5),
         {'build-wooden-hut': true}),

    when((house_type == 'clay_hut' && reed >= 2 && clay >= 5),
         {'build-clay-hut': true}),

    when((house_type == 'stone_house' && reed >= 2 && stone >= 5),
         {'build-stone-house': true})
  );
}

const src = setup({
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
      if (event['build-stable']) {
        game_context.supply.wood -= 2;
        game_context.farmyard[space_id] = {
          type: 'stable'
        };
      } else if (event['build-wooden-hut']) {
        game_context.supply.wood -= 5;
        game_context.supply.reed -= 2;
        game_context.farmyard[space_id] = {
          type: 'wooden_hut'
        };
      } else if (event['build-clay-hut']) {
        game_context.supply.clay -= 5;
        game_context.supply.reed -= 2;
        game_context.farmyard[space_id] = {
          type: 'clay_hut'
        };
      } else if (event['build-stone-house']) {
        game_context.supply.stone -= 5;
        game_context.supply.reed -= 2;
        game_context.farmyard[space_id] = {
          type: 'stone_house'
        };
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
});

export default src.createMachine({
  context: {
    task_id: 101,
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.replenish': {
          actions: 'replenish'
        },
        'task.selected': [
          {
            target: 'select-space',
            guard: 'enough-resources?'
          },
          {
            actions: 'abort'
          }
        ]
      }
    },
    'select-space': {
      entry: 'display-selection',
      on: {
        'space.selected': {
          target: 'work',
        },
        'task.exit': {
          target: 'idle',
          actions: 'done'
        }
      },
    },
    work: {
      entry: 'build',
      on: {
        'game.updated': [
          {
            target: 'select-space',
            guard: 'enough-resources?',
            actions: 'allow-early-exit'
          },
          {
            target: 'idle',
            actions: 'done'
          }
        ]
      }
    }
  }
});

