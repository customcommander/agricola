const is_end_of_stage = ctx =>
  ctx.numWorkersRemaining == 0 && (  ctx.turn === 4  /* end of stage 1 */
                                  || ctx.turn === 7  /* end of stage 2 */
                                  || ctx.turn === 9  /* end of stage 3 */
                                  || ctx.turn === 11 /* end of stage 4 */
                                  || ctx.turn === 13 /* end of stage 5 */
                                  || ctx.turn === 14 /* end of stage 6 */);

const not_end_of_game = ctx => ctx.turn < 14;

module.exports =
  { is_end_of_stage
  , not_end_of_game };
