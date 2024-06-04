import {
  enqueueActions,
  setup,
  sendTo
} from 'xstate';

import {
  produce
} from 'immer';

function reset({params}, draft) {
  const {task_id} = params;
  draft.tasks[task_id].selected = false;
  return draft;
}

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

    'reset':
    enqueueActions(({enqueue}, p) => {
      const {updater = reset, ...params} = p;
      enqueue({type: 'game-update', params: {...params, updater}});
      enqueue({type: 'ack'});
    }),

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
    })
  }
});

