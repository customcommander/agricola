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
           produce: produce(f)
         }));

export const ack = f => {
  const _ack =
    sendTo(({system}) => system.get('dispatcher'), {
      type: 'task.ack'
    });

  if (!f) {
    return _ack;
  }

  return enqueueActions(({enqueue}) => {
    enqueue(game_update(f));
    enqueue(_ack);
  });
};

