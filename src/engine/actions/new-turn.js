import {assign} from '@xstate/immer';
import {id} from '../utils.js';

// TODO:  can only update if all workers have been played.
//        if not then escalate and exit the game.
export default assign(ctx => {
  ctx.turn += 1;
  ctx.stage += +(  ctx.turn == 1
                || ctx.turn == 5
                || ctx.turn == 8
                || ctx.turn == 10
                || ctx.turn == 12
                || ctx.turn == 14);

  const next_task =
    Object.keys(ctx.tasks).find(
      t => ctx.tasks[t].type == 'turn-based' && ctx.tasks[t].turn == ctx.turn);

  ctx.tasks[next_task].change_id = id();
  ctx.tasks[next_task].available = true;
});
