import {setup, enqueueActions, sendTo} from 'xstate';
import {empty_spaces} from './util-farmyard.js';

const src = {
  actions: {
    plow: enqueueActions(({enqueue, context, event}) => {
      enqueue.assign({
        count: context.count - 1
      });

      enqueue.sendTo(context.parent, {
        type: 'action.plow.field',
        space_id: event.space_id
      });
    }),

    finalize: sendTo(({context}) => context.parent, {
      type: 'task.completed',
      task_id: 104
    })
  },
  guards: {
    'repeat?': ({context: {count}}) => count > 1
  }
};

const def = {
  context: ({input}) => ({
    parent: input.parent,
    count: input.count
  }),
  initial: 'select-space',
  states: {
    'select-space': {
      on: {
        'space.selected': [
          {
            target: 'select-space',
            guard: 'repeat?',
            actions: 'plow'
          },
          {
            target: 'done',
            actions: 'plow'
          }
        ]
      }
    },
    done: {
      type: 'final',
      entry: 'finalize'
    }
  }
};

export const plow = setup(src).createMachine(def);

