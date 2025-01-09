/*

Bootstrap.

001 Fields
002 Feed

103 Take Grain
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

*/

import {
  enqueueActions,
  fromPromise,
  sendTo,
  setup
} from 'xstate';

const taskdefs = {
  '001': {},
  '002': {feeding: true},
  '101': {selected: false},
  '102': {selected: false},
  '103': {selected: false},
  '104': {selected: false},
  '105': {selected: false},
  '106': {selected: false},
  '107': {selected: false, quantity: 2},
  '108': {selected: false, quantity: 1},
  '109': {selected: false, quantity: 1},
  '110': {selected: false, quantity: 1},
  '111': {selected: false, turn: 1, hidden: false},
  '112': {selected: false, turn: 2, hidden: true},
  '113': {selected: false, turn: 3, hidden: true},
  '114': {selected: false, turn: 4, quantity: 1, hidden: true},
  '115': {selected: false, turn: 5, hidden: true},
  '116': {selected: false, turn: 6, quantity: 1, hidden: true},
  '117': {selected: false, turn: 7, hidden: true},
  '118': {selected: false, turn: 8, hidden: true},
  '119': {selected: false, turn: 9, quantity: 1, hidden: true},
};

const src = setup({
  actors: {
    loader: fromPromise(async ({input: id}) => {
      const task = await import(/* webpackInclude: /\d+.js$/ */`./task-${id}.js`);
      return [id, task.default];
    })
  },

  guards: {
    'continue?': ({context}) => {
      return context.tasks.length > 1;
    }
  },

  actions: {
    boot: enqueueActions(({enqueue, context, event}) => {
      const [id, task] = event.output;
      const out = {...context.out, [id]: {...taskdefs[id]}};
      const tasks = context.tasks.slice(1);
      enqueue.assign({out, tasks});
      enqueue.spawnChild(task, {systemId: `task-${id}`});
    }),

    notify: sendTo(
      ({system}) => system.get('gamesys'),
      ({context}, params) => ({
        type: params.event,
        data: context.out
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
        params: {
          event: 'boot.failure'
        }
      }
    }
  }
});

