import {
  assign,
  enqueueActions,
  sendTo
} from 'xstate';

import {
  produce
} from 'immer';

const gamesys = ({system}) => system.get('gamesys');

export const early_exit = task_id =>
  sendTo(gamesys, {
    type: 'game.update',
    produce: produce(game_context => {
      game_context.early_exit = task_id;
      return game_context;
    })
  });

export const game_update = f =>
  sendTo(({system}) => system.get('gamesys'),
         ({context, event}) => ({
           type: 'game.update',
           reply_to: context.task_id,
           produce: produce(f.bind(null, {context, event}))
         }));

const _ack =
  sendTo(({system}) => system.get('dispatcher'),
         ({type: 'task.ack'}));

export const ack = f => {
  if (!f) {
    return _ack;
  }

  return enqueueActions(({enqueue, event}) => {
    enqueue(game_update(f));
    enqueue(_ack);
  });
};

const _complete =
  sendTo(({system}) => system.get('gamesys'),
         ({type: 'task.completed'}));

export const complete = f => {
  if (!f) {
    return _complete;
  }

  return enqueueActions(({enqueue, event}) => {
    enqueue(game_update(f));
    enqueue(_complete);
  });
};

export const abort = (task_id, err) =>
  sendTo(({system}) => system.get('gamesys'), {
    type: 'task.aborted',
    task_id,
    err
  });
