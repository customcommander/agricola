const {fromEventPattern} = require('rxjs');
const {map, distinct} = require('rxjs/operators');
const {some, when, eq, lte, constant, anyfn} = require('@customcommander/functionaut');

// Given a turn number returns the corresponding stage
const stage = some( when(lte(4) , constant(1))
                  , when(lte(7) , constant(2))
                  , when(lte(9) , constant(3))
                  , when(lte(11), constant(4))
                  , when(lte(13), constant(5))
                  ,               constant(6));

const endOfStage = anyfn( eq(4)
                        , eq(7)
                        , eq(9)
                        , eq(11)
                        , eq(13)
                        , eq(14));



module.exports = service => {
  const stream$ = fromEventPattern(handler => service.onChange(handler));
  return stream$.pipe( map(([ctx]) => ({ turn: ctx.turn
                                       , stage: stage(ctx.turn)
                                       , workers: ctx.numWorkers
                                       , workersLeft: ctx.numWorkersRemaining
                                       , harvest: ctx.numWorkersRemaining == 0 && endOfStage(ctx.turn)}))
                     , distinct(o => Object.values(o).join('/')));
};
