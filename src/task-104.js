import {
  enqueueActions,
  sendTo,
  setup
} from 'xstate';

import {
  produce
} from 'immer';

const game_update = f =>
  sendTo(({system}) => system.get('gamesys'), {
    type: 'game.update',
    produce: produce(f)
  });

const task_ack =
  sendTo(({system}) => system.get('dispatcher'), {
    type: 'task.ack'
  });

const src = setup({
  actions: {
    reset:
    enqueueActions(({enqueue, system}) => {

      enqueue(game_update(draft => {
        draft.tasks[104].selected = false;
        return draft;
      }));

      enqueue(task_ack);
    }),

    replenish: task_ack,

    'display-selection': 
    sendTo(({system}) => system.get('gamesys'), {
      type: 'game.update',
      produce: produce(draft => {
        let space_ids;
        space_ids = Object.keys(draft.farmyard);
        space_ids = space_ids.filter(id => !draft.farmyard[id]);
        draft.selection = space_ids.map(id => ({
          task_id: 104,
          space_id: id,
          plow: true
        }));
        return draft;
      })
    }),

    plow:
    enqueueActions(({enqueue, event, system}) => {
      const {space_id} = event;

      enqueue.sendTo(system.get('gamesys'), {
        type: 'game.update',
        produce: produce(draft => {
          draft.farmyard[space_id] = {type: 'field'};
          draft.selection = null;
          return draft;
        })
      });

      enqueue.sendTo(system.get('gamesys'), {
        type: 'task.completed'
      });
    }),
  }
});

export default src.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.reset': {
          actions: 'reset'
        },
        'task.replenish': {
          actions: 'replenish'
        },
        'task.selected': {
          target: 'select-space',
          actions: 'display-selection'
        }
      }
    },
    'select-space': {
      on: {
        'space.selected': {
          target: 'idle',
          actions: 'plow'
        }
      }
    }
  },
});
