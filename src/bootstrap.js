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

What does each property mean?

fields:
  The task will be invoked during the field phase.

*/

import {
  enqueueActions,
  fromPromise,
  sendTo,
  setup
} from 'xstate';

import task from './lib-task.js';

const taskdefs = {
  '001': {fields: true},
  '002': {feeding: true},
  '101': {selected: false},
  '102': {selected: false},
  '103': {selected: false},
  '104': {selected: false, repeat: true},
  '105': {selected: false},
  '106': {selected: false},
  '107': {selected: false, replenish: true, quantity: 2},
  '108': {selected: false, replenish: true, quantity: 1},
  '109': {selected: false, replenish: true, quantity: 1},
  '110': {selected: false, replenish: true, quantity: 1},
  '111': {selected: false, turn: 1, hidden: false},
  '112': {selected: false, turn: 2, hidden: true},
  '113': {selected: false, turn: 3, hidden: true},
  '114': {selected: false, turn: 4, replenish: true, quantity: 1, hidden: true},
  '115': {selected: false, turn: 5, hidden: true},
  '116': {selected: false, turn: 6, replenish: true, quantity: 1, hidden: true},
  '117': {selected: false, turn: 7, hidden: true},
  '118': {selected: false, turn: 8, hidden: true},
  '119': {selected: false, turn: 9, replenish: true, quantity: 1, hidden: true},
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
      return [id, process_task_defs(task.default), task.config];
    })
  },

  guards: {
    'continue?': ({context}) => {
      return context.tasks.length > 1;
    }
  },

  actions: {
    boot: enqueueActions(({enqueue, context, event}) => {
      const [id, defs, config] = event.output;
      const out = {...context.out, [id]: config ? {...config} : {...taskdefs[id]}};
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
      '116', '117', '118', '119', 

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

