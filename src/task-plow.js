import {setup, enqueueActions, sendTo} from 'xstate';
import {empty_spaces} from './util-farmyard.js';
import {produce} from 'immer';

const src = {
  actions: {
    plow: enqueueActions(({enqueue, context, event}) => {
      // This is updating the local context
      enqueue.assign({
        count: context.count - 1
      });

      // This is a request to update the game context
      enqueue.sendTo(context.parent, {
        type: 'game.update',
        from: event,
        produce: produce((draft, {space_id}) => {
          draft.farmyard[space_id] = {type: 'field'};
          return draft;
        })
      });
    }),

    'task->game': sendTo(({context}) => context.parent, {
      type: 'task.completed',
      task_id: 104
    })
  },
  guards: {
    /*
      Note to self:

      Some occupations or minor improvement cards
      allow a player to plow more than one field
      in the same turn. While I don't predict
      I'll go that far in my implementation of the game,
      I thought it would be nice if this actor could be
      reused to implement these cards.

    */
    'repeat?': ({context: {count}}) => count > 1
  }
};

export const actor = setup(src).createMachine({
  context: ({input}) => ({
    parent: input.parent,
    count: 1
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
      entry: 'task->game'
    }
  }
});

// TODO: must check that we've got some space left.
export const abort = () => false;
