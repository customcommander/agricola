import {
  enqueueActions,
  sendTo,
  setup
} from 'xstate';

import {
  ack,
  complete,
  game_update,
} from './task-lib.js'


const src = setup({
  actions: {
    reset:
    ack((_, draft) => {
      draft.tasks[104].selected = false;
      return draft;
    }),

    replenish:
    ack(),

    'display-selection':
    game_update((_, draft) => {
      let space_ids;
      space_ids = Object.keys(draft.farmyard);
      space_ids = space_ids.filter(id => !draft.farmyard[id]);
      draft.selection = space_ids.map(id => ({
        task_id: 104,
        space_id: id,
        plow: true
      }));
      return draft;
    }),

    plow:
    complete(({event}, draft) => {
      const {space_id} = event;
      draft.farmyard[space_id] = {type: 'field'};
      draft.selection = null;
      return draft;
    })
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
