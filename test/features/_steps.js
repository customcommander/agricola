import {Given, When, Then, defineParameterType} from '@cucumber/cucumber';

defineParameterType({
  name: 'quantity',
  regexp: /\d+|the/,
  transformer: qty => {
    if (qty === 'the') return 1;
    return Number(qty);
  }
});

Given('I start a new game', function () {
  this.startGame();
});

When('I complete/finish {quantity} round(s)', function (n) {
  this.completeNTurn(n);
});

Then('the game ends', async function () {
  await this.assertIsEndOfGame();
});
