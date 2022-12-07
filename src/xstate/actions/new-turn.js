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
  ctx.tasks[ctx.tasks_order[ctx.turn - 1]].change_id = id();
  ctx.tasks[ctx.tasks_order[ctx.turn - 1]].available = true;
});
