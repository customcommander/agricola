import test from 'tape';
import {waitFor} from 'xstate/lib/waitFor.js';
import sut from '../src/xstate/main.js';

test('starting a game', async (t) => {
  const [game, start] = sut();
  start();
  await waitFor(game, state => state.matches('work'));
  t.pass('can start a new game');
  t.end();
});
