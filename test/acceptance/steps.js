import {
  Given,
  When,
  Then
} from '@cucumber/cucumber';

const task_map = {
  'Day Laborer'          : 106,
  'Plow 1 Field'         : 104,
  'Sow and/or Bake bread': 113,
  'Take 1 Grain'         : 103,
  'Take x Clay'          : 108,
  'Take x Reed'          : 109,
  'Take x Wood'          : 107,
};

const stock_map = {
  'Clay': 108,
  'Food': 110,
  'Reed': 109,
  'Wood': 107,
}

Given('I start playing', async function () {
  await this.start();
});

When('I select {string}', async function (selection) {
  await this.send({type: 'task.selected', task_id: task_map[selection]});
});

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
    return quantity === Number(Quantity);
  }));
});

