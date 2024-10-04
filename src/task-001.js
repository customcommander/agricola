/*

  Implements the field phase during harvesting.

*/

import {or} from 'xstate';
import {base} from './task-lib.js';

function harvest_fields(_, game_context) {
  const {supply, farmyard} = game_context;
  const ids = Object.keys(farmyard);

  for (let id of Object.keys(farmyard)) {
    if (farmyard[id]?.type != 'field') {
      continue;
    }

    if (farmyard[id].grain) {
      farmyard[id].grain -= 1;
      supply.grain += 1;
    }

    if (farmyard[id].vegetable) {
      farmyard[id].vegetable -= 1;
      supply.vegetable += 1;
    }
  }
}

export default base.createMachine({
  context: {},
  on: {
    'task.harvest-fields': {
      actions: {
        type: 'game-update',
        params: {
          reply_to: '001',
          updater: harvest_fields
        }
      }      
    },
    'game.updated': {
      actions: 'ack'
    }
  }
});

