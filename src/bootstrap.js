/*

bootstrap.

*/

import {
  enqueueActions,
  fromPromise,
  sendTo,
  setup
} from 'xstate';

const taskdefs = {
  // Fields
  '001': {},
  // Feed
  '002': {feeding: true},
  '101': {selected: false},
  '102': {selected: false},
  // Take Grain
  '103': {selected: false},
  '104': {selected: false},
  '105': {selected: false},
  '106': {selected: false},
  // Take x Wood
  '107': {selected: false, quantity: 2},
  // Take x Clay
  '108': {selected: false, quantity: 1},
  // Take x Reed
  '109': {selected: false, quantity: 1},
  // Fishing
  '110': {selected: false, quantity: 1},
  // Fences
  '111': {selected: false, turn: 1, hidden: false},
  // Major Improvement
  '112': {selected: false, turn: 2, hidden: true},
  // Sow and/or Bake bread
  '113': {selected: false, turn: 3, hidden: true},
  // Take x Sheep
  '114': {selected: false, turn: 4, quantity: 1, hidden: true},
  // Family Growth
  '115': {selected: false, turn: 5, hidden: true},
  // Take x Stone
  '116': {selected: false, turn: 6, quantity: 1, hidden: true},
  // After Renovation also Major Improvement
  '117': {selected: false, turn: 7, hidden: true},
  // Take Vegetable
  '118': {selected: false, turn: 8, hidden: true},
  // Take x Wild Boar
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

