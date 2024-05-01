import {
  assign,
  setup,
} from 'xstate';

import def from './game-machine.json';

const src = {
  actions: {
    setup_new_turn: assign({
      turn: ({context}) => context.turn + 1,
      workers: () => 2,
    }),

    allocate_worker: assign({
      workers: ({context}) => {
        const update = context.workers - 1;
        console.log(`remaining workers ${update}`);
        return update;
      }
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

