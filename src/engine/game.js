import {
  assign,
  emit,
  enqueueActions,
  setup,
} from 'xstate';


import work from './work.js';

const src = {
  actors: {
    work
  },
  actions: {
    setup_turn: enqueueActions(({enqueue}) => {
      enqueue.assign({
        turn: ({context}) => context.turn + 1
      });
      enqueue.emit(({context}) => ({
        type: 'new_turn',
        turn: context.turn
      }));
    })
  },
  guards: {
    is_harvest_time: ({context}) => {
      const {turn} = context;
      return [4, 7, 9, 11, 13, 14].includes(turn);
    },
    is_not_last_turn: ({context}) => {
      const {turn} = context;
      return turn < 14;
    }
  }
};

export default setup(src).createMachine({
  context: {
    workers: 2,
    turn: 0
  },
  initial: 'game_start',
  states: {
    game_start: {
      after: {
        500: 'new_turn'
      }
    },
    new_turn: {
      entry: 'setup_turn',
      after: {
        500: 'work'
      }
    },
    work: {
      invoke: {
        id: 'work-actor',
        src: 'work',
        input: ({context}) => ({
          workers: context.workers
        }),
        onDone: [
          { target: 'harvest', guard: 'is_harvest_time' },
          { target: 'new_turn' }
        ],
      }
    },
    harvest: {
      after: {
        500: [
          { target: 'new_turn', guard: 'is_not_last_turn' },
          { target: 'game_over' }
        ]
      }
    },
    game_over: {
      type: 'final'
    }
  }
});
