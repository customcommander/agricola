const {mult, map: fmap} = require('@customcommander/functionaut');
const {fromEventPattern} = require('rxjs');
const {map, distinct} = require('rxjs/operators');

const countUnusedSpaces = ctx =>
  Object.values(ctx.spaces).filter(sp => sp.type == 'unused').length;

const scoreUnusedSpaces = n => n * -1;

const scoreMap = {
  family: [ctx => ctx.numWorkers, mult(3)],
  unusedSpaces: [countUnusedSpaces, scoreUnusedSpaces]
};

module.exports = service =>
  fromEventPattern(handler => service.onChange(handler))
    .pipe( map(([ctx]) => fmap(([f, g, ...meta]) => [f(ctx), g(f(ctx)), ...meta], scoreMap))
         , distinct(o => JSON.stringify(o)));
