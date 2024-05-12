import {
  assign,
  enqueueActions,
  sendTo,
  setup,
} from 'xstate';

import {produce} from 'immer';

import {
  task_start,
  task_stop
} from './task.js';

import def from './game-machine.json';

const src = {
  actions: {
    setup_new_turn: assign(({context}) => produce(context, draft => {
      draft.turn += 1;
      draft.workers = draft.family;
      draft.tasks["104"].selected = false;
      draft.tasks["104"].done = false;
      draft.tasks["107"].selected = false;
      draft.tasks["107"].done = false;
      draft.tasks["107"].quantity += 2;
      draft.tasks["108"].selected = false;
      draft.tasks["108"].done = false;
      draft.tasks["108"].quantity += 1;
      draft.tasks["109"].selected = false;
      draft.tasks["109"].done = false;
      draft.tasks["109"].quantity += 1;
      return draft;
    })),

    'task-start': task_start,
    'task-stop': task_stop,

    'forward-to-action-daemon':
    sendTo(({context, event}) => context[`task-${event.task_id}-ref`],
           ({event}) => event),

    'game-update': assign(({context, event}) => {
      return event.produce(context, event.from);
    })
  },

  guards: {
    has_workers: ({context}) => {
      const check = context.workers > 0;
      return check;
    },

    is_harvest_time: ({context}) => {
      const {turn} = context;
      const check = [4, 7, 9, 11, 13, 14].includes(turn);
      console.log(`is harvest time? ${turn} ${check}`);
      return check;
    },

    is_last_turn: ({context}) => {
      const {turn} = context;
      const check = turn === 14;
      console.log(`is last turn? ${turn} ${check}`);
      return check;
    }
  }
};

export default setup(src).createMachine(def);

