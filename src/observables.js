import {
  Subject,
  distinctUntilChanged,
  fromEventPattern,
  map,
  share,
} from 'rxjs';

import deep_equal from 'fast-deep-equal';

import {empty_spaces} from './util-farmyard.js';

export const observe_game = game =>
  fromEventPattern(
    (handler) => game.subscribe(handler),
    (_, subscription) => subscription.unsubscribe()
  )
  .pipe(
    share()
  );

export const turn$ = snapshot$ => snapshot$.pipe(
  map(({context: {turn, workers}}) => ({turn, workers})),
  distinctUntilChanged(deep_equal)
);

export const tasks$ = snapshot$ => snapshot$.pipe(
  map(snapshot => snapshot.context.tasks),
  distinctUntilChanged(deep_equal)
);

export const supply$ = snapshot$ => snapshot$.pipe(
  map(snapshot => snapshot.context.supply),
  distinctUntilChanged(deep_equal)
);

export const farmyard$ = snapshot$ => snapshot$.pipe(
  map(snapshot => snapshot.context.farmyard),
  distinctUntilChanged(deep_equal)
);

export const selection$ = snapshot$ => snapshot$.pipe(
  map(({context: {selection}}) => selection),
  distinctUntilChanged(deep_equal)
);

export const error$ = snapshot$ => snapshot$.pipe(
  map(({context: {error}}) => error),
  distinctUntilChanged()
);

export const early_exit$ = snapshot$ => snapshot$.pipe(
  map(({context: {early_exit}}) => early_exit),
  distinctUntilChanged()
);

