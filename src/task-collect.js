import {
  enqueueActions,
  setup,
  sendTo
} from 'xstate';

import {
  produce
} from 'immer';

function replenish({params}, draft) {
  const {task_id, inc} = params;
  draft.tasks[task_id].quantity += inc;
  return draft;
}

function collect({params}, draft) {
  const {task_id, supply} = params;
  const {quantity} = draft.tasks[task_id];
  draft.supply[supply] += quantity;
  draft.tasks[task_id].quantity = 0;
  return draft;
}

function plow({params}, draft) {
  const {space_id} = params;
  draft.farmyard[space_id] = {type: 'field'};
  return draft;
}

/*
TODO:
If things of the same kind already exist
then only the **empty** spaces adjacent to
those things should be considered.
*/
function selection({params}, draft) {
  const {task_id, opts} = params;
  const spaces = Object.entries(draft.farmyard);
  const sel = opts.flatMap(opt => {
    let avail;
    avail = spaces.filter(([, sp]) => sp == null);
    avail = avail.map(([space_id]) => ({task_id, space_id, [opt]: true}));
    return avail;
  });
  draft.selection = sel;
  return draft;
}

function selection_clear({}, draft) {
  draft.selection = null;
  return draft;
}

const gamesys = ({system}) => system.get('gamesys');

const dispatcher = ({system}) => system.get('dispatcher');

export default setup({
  actions: {
    'game-update':
    sendTo(gamesys, ({event}, p) => {
      let {updater, ...params} = p;
      updater = updater.bind(null, {event, params});
      return {
        type: 'game.update',
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

    'replenish':
    enqueueActions(({enqueue}, p) => {
      const {updater = replenish, ...params} = p;
      enqueue({type: 'game-update', params: {...params, updater}});
      enqueue({type: 'ack'});
    }),

    'collect':
    enqueueActions(({enqueue}, p) => {
      const {updater = collect, ...params} = p;
      enqueue({type: 'game-update', params: {...params, updater}});
      enqueue({type: 'task-complete'});
    }),

    'build':
    enqueueActions(({enqueue}, p) => {
      const {build, ...params} = p;
      const updater = build == 'plow' ? plow : null;
      enqueue({type: 'game-update', params: {updater, ...params}});
    }),

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
  }
});

