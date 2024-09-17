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
    'Take 1 Grain': 103,
    'Take x Wood':  107,
    'Take x Clay':  108,
    'Take x Reed':  109
  };

  await this.send({type: 'task.selected', task_id: task_map[selection]});
});

Then('the current turn is {int}', async function (expected_turn) {
  await this.assert(({turn}) => turn === expected_turn);
});

