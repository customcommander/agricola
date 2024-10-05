import {
  Given,
  When,
  Then
} from '@cucumber/cucumber';

Given('I start playing', async function () {
  await this.start();
});

When('I select {string}', async function (selection) {
  const task_map = {
    'Take 1 Grain'         : 103,
    'Plow 1 Field'         : 104,
    'Take x Wood'          : 107,
    'Take x Clay'          : 108,
    'Take x Reed'          : 109,
    'Sow and/or Bake bread': 113
  };

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

