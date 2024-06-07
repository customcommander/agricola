import setup from './task-collect.js';

function plow({params}, game_context) {
  const {space_id} = params;
  game_context.farmyard[space_id] = {type: 'field'};
  return game_context;
}

export default setup.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.selected': {
          target: 'select-space'
        }
      }
    },
    'select-space': {
      entry: {
        type: 'display-selection',
        params: {
          task_id: 104,
          opts: ['plow']
        }
      },
      on: {
        'space.selected': {
          target: 'work'
        }
      },
      exit: 'clear-selection'
    },
    work: {
      entry: {
        type: 'game-update',
        params: ({event}) => ({
          space_id: event.space_id,
          updater: plow
        })
      },
      always: {
        target: 'idle',
        actions: 'task-complete'
      }
    }
  },
});
