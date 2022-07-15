const {mult, map: fmap} = require('@customcommander/functionaut');
const {fromEventPattern} = require('rxjs');
const {map, distinct} = require('rxjs/operators');

const scoreMap = {
  family: [ctx => ctx.numWorkers, mult(3)]
};

module.exports = service =>
  fromEventPattern(handler => service.onChange(handler))
    .pipe( map(([ctx]) => fmap(([f, g, ...meta]) => [f(ctx), g(f(ctx)), ...meta], scoreMap))
         , distinct(o => JSON.stringify(o)));
