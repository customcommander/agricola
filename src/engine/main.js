import {createActor, waitFor} from 'xstate';
import game from './game.js';

const game_actor = createActor(game);

game_actor.subscribe(snapshot => {
  console.log(`${snapshot.value} turn: ${snapshot.context.turn}`);
});

game_actor.on('new_turn', e => {
  console.log(`new turn!`, e);
});

game_actor.start();
