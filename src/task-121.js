export default {

  replenish: ({task_id}, game) => {
    game.tasks[task_id].quantity += 1;
    return game;
  },

  selected: 'TODO'

};
