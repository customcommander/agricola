import {
  enqueueActions,
  sendTo
} from 'xstate';

import {
  produce
} from 'immer';

export const game_update = f =>
  sendTo(({system}) => system.get('gamesys'),
         ({context, event}) => ({
           type: 'game.update',
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
  return enqueueActions(({enqueue, event}) => {
    enqueue(game_update(f));
    enqueue(_complete);
  });
};


