import {Given, When, Then} from '@cucumber/cucumber';

Given('I start a new game', function () {
  this.start();
});

When('I complete {int} round(s)', async function (n) {
  await this.completeNTurn(n);
});

Then('it is harvest time', async function () {
  await this.assertIsHarvestTime();
});

When('I am done harvesting', function () {
  this.completeHarvest();
});

Then('the game ends', async function () {
  await this.assertIsEndOfGame();
});
