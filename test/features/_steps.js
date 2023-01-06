import {Given, When, Then} from '@cucumber/cucumber';
import { take } from 'rxjs';

Given('I start a new game', function () {
  this.startGame();
});

When('I complete {int} round(s)', async function (n) {
  await this.completeNTurn(n);
});

Then('the new action is {word}', async function (task_id) {
  await new Promise((resolve, reject) => {
    this.turn$.pipe(take(1)).subscribe(({new_tasks}) => {
      if (new_tasks.includes(task_id)) {
        resolve(true);
      } else {
        reject(new Error(`Expected to find '${task_id}' in '[${new_tasks.join(',')}]'`));
      }
    });
  });
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
