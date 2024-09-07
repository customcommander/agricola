import {World, setWorldConstructor} from '@cucumber/cucumber';

setWorldConstructor(class extends World {

  constructor(options) {
    super(options);
  }

});

