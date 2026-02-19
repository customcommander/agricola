import {
  Given,
  When,
  Then
} from '@cucumber/cucumber';

const task_map = {
  'Build Rooms and/or Build Stables': 101,
  'Day Laborer'                     : 106,
  'Plow 1 Field'                    : 104,
  'Sow and/or Bake bread'           : 113,
  'Take 1 Grain'                    : 103,
  'Take x Clay'                     : 108,
  'Take x Reed'                     : 109,
  'Take x Wood'                     : 107,
};

const stock_map = {
  'Wood':       107,
  'Clay':       108,
  'Reed':       109,
  'Food':       110,
  'Sheep':      114,
  'Stone':      116,
  'Wild Boar':  119,
  'Stone (II)': 120,
  'Cattle':     121,
};

Given('I start playing', async function () {
  await this.start();
});

When('I select {string}', async function (selection) {
  await this.send({type: 'task.selected', task_id: task_map[selection]});
});

// Place workers on non-replenishable tasks
When('I place my workers', async function () {
  await this.send({type: 'task.selected', task_id: '103'}); // Grain
  await this.send({type: 'task.selected', task_id: '106'}); // Laborer
})

Then('I plow {word}', async function (space_id) {
  await this.send({type: 'select.plow', task_id: '104', space_id});
});

Then('I sow grain on {word}', async function (space_id) {
  await this.send({type: 'select.sow-grain', task_id: '113', space_id});
});

Then('I have {int} {word} in my supply', async function (quantity, type) {
  await this.assert(({supply}) => supply[type] === quantity);
});

Then('I have {int} {word} on {word}', async function (quantity, type, space_id) {
  await this.assert(({farmyard}) => {
    const space = farmyard[space_id];
    return space[type] === quantity;
  });
});

Then('the current turn is {int}', async function (expected_turn) {
  await this.assert(({turn}) => turn === expected_turn);
});

Then('I have the following stock on the board', async function (table) {
  await this.assert(game => table.hashes().every(({Stock, Quantity}) => {
    const task_id = stock_map[Stock];
    const {quantity} = game.tasks[task_id];
    if (quantity === Number(Quantity)) {
      return true;
    } else {
      throw new Error(`Expected quantity for '${Stock}' to be ${Quantity}. (Was ${quantity})`);
    }
  }));
});

When('I feed my family', async function () {
  await this.wait(state => state.matches({harvest: 'feed'}));
  await this.send({type: 'task.completed', task_id: '002'});
});

When('I complete the stage', async function () {
  await this.wait(state => state.matches({harvest: 'feed'}));
  await this.send({type: 'task.completed', task_id: '002'});
});

Then('the game tells me I do not have enough resources', async function () {
  await this.assert(game => game.error === 'NOT_ENOUGH_RESOURCES');
});

