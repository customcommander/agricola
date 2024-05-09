import {
  assign,
  enqueueActions,
  sendTo,
  setup,
} from 'xstate';

import {
  task_start,
  task_stop
} from './task.js';

import {
  task_collect_done
} from './task-collect.js';

import def from './game-machine.json';

const src = {
  actions: {
    setup_new_turn: assign({
      turn: ({context}) => context.turn + 1,
      workers: ({context}) => context.family,
      tasks: ({context}) => context.tasks.map(t => {
        const update = {...t, selected: false, done: false};
        if (t.id == 101) update.quantity += 2;
        if (t.id == 102) update.quantity += 1;
        if (t.id == 103) update.quantity += 1;
        return update;
      })
    }),

    'task-start': task_start,
    'task-stop': task_stop,

    'task-collect-done': task_collect_done,

    'forward-to-action-daemon':
    sendTo(({context, event}) => context[`task-${event.task_id}-ref`],
           ({event}) => event),

    'plow-field': enqueueActions(({enqueue}) => {
      enqueue.assign({
        farmyard: ({context: {farmyard}, event}) => ({
          ...farmyard,
          [event.space_id]: {type: "field"}
        })
      });
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

