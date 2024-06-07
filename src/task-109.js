import setup from './task-collect.js';

function replenish(_, game_context) {
  game_context.tasks[109].quantity += 1;
  return game_context;
}

function collect(_, game_context) {
  const {quantity} = game_context.tasks[109];
  game_context.supply.reed += quantity;
  game_context.tasks[109].quantity = 0;
  return game_context;
}


export default setup.createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        'task.replenish': {
          actions: [
            {type: 'game-update', params: {updater: replenish}},
            {type: 'ack'}
          ]
        },
        'task.selected': {
          actions: [
            {type: 'game-update', params: {updater: collect}},
            {type: 'task-complete'}
          ]
        }
      }
    }
  }
});

