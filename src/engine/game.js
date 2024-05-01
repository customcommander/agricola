import {
  assign,
  emit,
  enqueueActions,
  setup,
} from 'xstate';

import def from './game-machine.json';
import work from './work.js';

const src = {
  actors: {
    work
  },
  actions: {
    setup_turn: enqueueActions(({enqueue}) => {
      enqueue.assign({
        turn: ({context}) => context.turn + 1,
        workers: () => 2,
      });
      enqueue.emit(({context}) => ({
        type: 'new_turn',
        turn: context.turn
      }));
    }),

    allocate_worker: assign({
      workers: ({context}) => {
        console.log(`workers=${context.workers}`);
        return context.workers - 1;
      }
    })
  },
  guards: {
    has_workers: ({context}) => context.workers > 0,

    is_harvest_time: ({context}) => {
      const {turn} = context;
      const check = [4, 7, 9, 11, 13, 14].includes(turn);
      console.log(`is harvest time? ${check}`);
      return check;
    },

    is_last_turn: ({context}) => {
      const {turn} = context;
      const check = turn === 14;
      console.log(`is last turn? ${check}`);
      return check;
    }
  }
};

export default setup(src).createMachine(def);

