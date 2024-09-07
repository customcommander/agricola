import {Given, Then} from '@cucumber/cucumber';

Given('I start playing', function () {
  this.start();
});

Then('the current turn is {int}', async function (expected_turn) {
  await this.assert(({turn}) => turn === expected_turn);
});

