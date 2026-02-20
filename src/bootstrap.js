/*

Bootstrap.

0XX Game Stuff
---
001 Fields
002 Feed

1XX Actions (on the board)
---
101
102
103 Take Grain
104 Plow 1 Field
105 1 Occupation
106 Day Laborer
107 Take x Wood
108 Take x Clay
109 Take x Reed
110 Fishing
111 Fences
112 Major/Minor Improvement
113 Sow and/or Bake bread
114 Take x Sheep
115 Family Growth
116 Take x Stone
117 After Renovation also Major Improvement
118 Take Vegetable
119 Take x Wild Boar
120 Take x Stone
121 Take x Cattle
122 Family growth (even without space in your home)
123 Plow 1 Field and/or Sow
124 After Renovation also Fences

*/

import {
  enqueueActions,
  fromPromise,
  sendTo,
  setup
} from 'xstate';

import task from './lib-task.js';

const taskdefs = {
  '001': {active:  true                                                      },
  '002': {active:  true                                                      },
  '101': {active:  true, selected: false                                     },
  '102': {active:  true, selected: false                                     },
  '103': {active:  true, selected: false                                     },
  '104': {active:  true, selected: false                                     },
  '105': {active:  true, selected: false                                     },
  '106': {active:  true, selected: false                                     },
  '107': {active:  true, selected: false,                         quantity: 2},
  '108': {active:  true, selected: false,                         quantity: 1},
  '109': {active:  true, selected: false,                         quantity: 1},
  '110': {active:  true, selected: false,                         quantity: 1},
  '111': {active:  true, selected: false, turn:  1, hidden: false             },
  '112': {active: false, selected: false, turn:  2, hidden:  true             },
  '113': {active: false, selected: false, turn:  3, hidden:  true             },
  '114': {active: false, selected: false, turn:  4, hidden:  true, quantity: 0},
  '115': {active: false, selected: false, turn:  5, hidden:  true             },
  '116': {active: false, selected: false, turn:  6, hidden:  true, quantity: 0},
  '117': {active: false, selected: false, turn:  7, hidden:  true             },
  '118': {active: false, selected: false, turn:  8, hidden:  true             },
  '119': {active: false, selected: false, turn:  9, hidden:  true, quantity: 0},
  '120': {active: false, selected: false, turn: 10, hidden:  true, quantity: 0},
  '121': {active: false, selected: false, turn: 11, hidden:  true, quantity: 0},
  '122': {active: false, selected: false, turn: 12, hidden:  true             },
  '123': {active: false, selected: false, turn: 13, hidden:  true             },
  '124': {active: false, selected: false, turn: 14, hidden:  true             },
};

function process_task_defs(defs) {
  return Object.keys(defs).reduce((acc, k) => {
    const def = defs[k];

    if (def === 'TODO') {
      acc[k] = {
        check: () => 'TODO',
      };
    }
    else if (typeof def === 'function') {
      acc[k] = {
        execute: def
      };
    }
    else {
      acc[k] = def;
    }

    return acc;
  }, {});
}

const src = setup({
  actors: {
    loader: fromPromise(async ({input: id}) => {
      const task = await import(/* webpackInclude: /\d+.js$/ */`./task-${id}.js`);
      return [id, process_task_defs(task.default)];
    })
  },

  guards: {
    'continue?': ({context}) => {
      return context.tasks.length > 1;
    }
  },

  actions: {
    boot: enqueueActions(({enqueue, context, event}) => {
      const [id, defs] = event.output;
      const out = {...context.out, [id]: {...taskdefs[id]}};
      const tasks = context.tasks.slice(1);
      enqueue.assign({out, tasks});
      enqueue.spawnChild(task, {
        systemId: `task-${id}`,
        input: {
          task_id: id,
          ...defs
        }
      });
    }),

    notify: sendTo(
      ({system}) => system.get('gamesys'),
      ({context}, params) => ({
        type: params.event,
        data: context.out,
        error: params.error
      })
    )
  },
});

export default src.createMachine({
  context: ({input}) => ({
    // This will hold the data for each task
    // to be merged into the game state.
    out: {},

    // A list of all permanent tasks (e.g. actions,
    // major improvements and other game-level things)
    // plus minor improvements and occupations.
    tasks: [
      '001', '002',
      '101', '102', '103', '104', '105',
      '106', '107', '108', '109', '110',
      '111', '112', '113', '114', '115',
      '116', '117', '118', '119', '120',
      '121', '122', '123', '124',

      // Eventually this will contain the task ids
      // of selected occupations and minor improvements.
      ...input?.tasks ?? []
    ]
  }),
  initial: 'loop',
  states: {
    loop: {
      invoke: {
        src: 'loader',
        input: ({context}) => context.tasks[0],
        onDone: [
          {
            guard: 'continue?',
            target: 'loop',
            actions: 'boot',
            reenter: true
          },
          {
            target: 'success',
            actions: 'boot'
          }
        ],
        onError: 'failure'
      }
    },

    success: {
      entry: {
        type: 'notify',
        params: {
          event: 'boot.success'
        }
      }
    },

    failure: {
      entry: {
        type: 'notify',
        params: ({event: ev}) => ({
          event: 'boot.failure',
          error: ev.error.message
        })
      }
    }
  }
});

