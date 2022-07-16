const {Given, When, Then} = require('@cucumber/cucumber');

Given('I start a new game', function () {
  this.start();
});

When('I complete {int} round(s)', function (n) {
  this.completeNTurn(n);
});

Then('it is harvest time', function () {
  this.assertIsHarvestTime();
});

When('I am done harvesting', function () {
  this.completeHarvest();
});

Then('the actions should be:', function (table) {
  for ([action, stock] of table.raw()) {
    this.assertActionStock(action, stock);
  }
});

When('I complete the {string} action', function (action) {
  if (action == 'take x wood') {
    this.takeXWood();
  }
  if (action == 'take x clay') {
    this.takeXClay();
  }
});

Then('I have {int} {word} in my reserve', function (num, material) {
  this.assertReserve(material, num);
});

Then('the game ends', function () {
  this.assertIsEndOfGame();
});
