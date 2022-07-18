const {mult, map: fmap, some, when, constant, lt} = require('@customcommander/functionaut');
const {fromEventPattern} = require('rxjs');
const {map, distinct, tap} = require('rxjs/operators');

const countUnusedSpaces = ctx =>
  Object.values(ctx.spaces).filter(sp => sp.type == null).length;

const scoreUnusedSpaces = n => n * -1;

const count_grain = ctx => {
  const in_reserve = ctx.reserve.grain;
  const in_fields = Object.values(ctx.spaces).filter(sp => sp.type == 'field' && sp.grain > 0).length;
  return in_reserve + in_fields;
};

const score_grain = some( when(lt(1), constant(-1))
                        , when(lt(4), constant( 1))
                        , when(lt(7), constant( 2))
                        , when(lt(8), constant( 3))
                        ,             constant( 4));

const count_fields = ctx =>
  Object.values(ctx.spaces).filter(sp => sp.type == 'field').length;

const score_fields = some( when(lt(2), constant(-1))
                         , when(lt(3), constant( 1))
                         , when(lt(4), constant( 2))
                         , when(lt(5), constant( 3))
                         ,             constant( 4));

const scoreMap =
  { family:       [ctx => ctx.numWorkers, mult(3)          ]
  , unusedSpaces: [countUnusedSpaces    , scoreUnusedSpaces]
  , grain:        [count_grain          , score_grain      ]
  , fields:       [count_fields         , score_fields     ]};


const compute_score = ([ctx]) => fmap(([f, g, ...meta]) => {
  const count = f(ctx);
  const points = g(count);
  return [count, points, ...meta];
}, scoreMap);

const with_total = score => {
  const total = Object.values(score).reduce((tot, [_, points]) => tot + points, 0);
  return {...score, total};
};

const score_signature = score => JSON.stringify(score);

module.exports = service =>
  fromEventPattern(handler => service.onChange(handler))
    .pipe( map(compute_score)
         , map(with_total)
         , distinct(score_signature));
