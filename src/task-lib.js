import {
  enqueueActions,
  setup,
  sendTo
} from 'xstate';

import {
  produce
} from 'immer';

/*
TODO:
If things of the same kind already exist
then only the **empty** spaces adjacent to
those things should be considered.
*/
function selection({params}, draft) {
  const {task_id, opts} = params;
  const spaces = Object.entries(draft.farmyard);

  draft.selection = opts.flatMap(opt => {
    const avail = spaces.filter(([, sp]) => sp == null);
    return avail.map(([space_id]) => ({type: opt, task_id, space_id}));
  });

  return draft;
}

function selection_clear({}, draft) {
  draft.selection = null;
  return draft;
}

function early_exit({params}, draft) {
  const {task_id} = params;
  draft.early_exit = task_id;
  return draft;
}

const gamesys = ({system}) => system.get('gamesys');

const dispatcher = ({system}) => system.get('dispatcher');

export const base = setup({
  actions: {
    'game-update':
    sendTo(gamesys, ({event}, p) => {
      let {updater, reply_to, ...params} = p;
      updater = updater.bind(null, {event, params});
      return {
        type: 'game.update',
        reply_to,
        updater: produce(updater)
      };
    }),

    'ack':
    sendTo(dispatcher, {type: 'task.ack'}),

    'abort':
    sendTo(gamesys, (_, {task_id, err}) => ({
      type: 'task.aborted',
      task_id,
      err
    })),

    'task-complete':
    sendTo(gamesys, {type: 'task.completed'}),

    'display-selection':
    enqueueActions(({enqueue}, p) => {
      const updater = selection;
      enqueue({type: 'game-update', params: {updater, ...p}});
    }),

    'clear-selection':
    enqueueActions(({enqueue}) => {
      const updater = selection_clear;
      enqueue({type: 'game-update', params: {updater}});
    }),

    /*
      Some cards
     */
    'early-exit-init':
    enqueueActions(({enqueue}, p) => {
      const {task_id} = p;
      const updater = early_exit;
      enqueue({type: 'game-update', params: {updater, task_id}});
    }),

    'early-exit-stop':
    enqueueActions(({enqueue}) => {
      const updater = early_exit;
      enqueue({type: 'game-update', params: {updater, task_id: null}});
    })
  },
  guards: {
    'enough-supply?':
    ({event: {game_context}}, params) => {
      const {supply} = game_context;
      const checks = Object.entries(params);
      return checks.every(([k, min]) => supply[k] >= min);
    },

    // True if there is at least one grain available in the supply.
    'has-grain?':
    ({event: {game_context}}) => {
      const {supply} = game_context;
      return supply.grain > 0;
    },

    // True if there is at least one vegetable available in the supply.
    'has-vegetable?':
    ({event: {game_context}}) => {
      const {supply} = game_context;
      return supply.vegetable > 0;
    },

    // True if there is at least one empty field.
    'has-empty-fields?':
    ({event: {game_context}}) => {
      const {farmyard} = game_context;
      const spaces = Object.values(farmyard);
      return spaces.some(space => {
        if (space?.type !== 'field') return false;
        const {grain = 0, vegetable = 0} = space;
        return !grain && !vegetable;
      });
    }
  }
});

