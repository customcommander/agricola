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
    enqueueActions(({enqueue}, params) => {
      enqueue({type: 'game-update', params: {...params, updater: reset}});
      enqueue({type: 'ack'});
    }),

    'replenish':
    enqueueActions(({enqueue}, params) => {
      enqueue({type: 'game-update', params: {...params, updater: replenish}});
      enqueue({type: 'ack'});
    }),

    'collect':
    enqueueActions(({enqueue}, params) => {
      enqueue({type: 'game-update', params: {...params, updater: collect}});
      enqueue({type: 'task-complete'});
    })
  }
});

