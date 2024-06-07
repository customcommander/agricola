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
    return avail.map(([space_id]) => ({task_id, space_id, opt}));
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
  }
});

