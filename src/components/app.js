import {LitElement, css, html} from 'lit';

import {createActor} from 'xstate';

import {
  observe_game,
  observe_supply,
  observe_tasks,
  observe_turn,
} from '../observables.js';

import deep_equal from 'fast-deep-equal';

import {
  provide_messages,
  provide_supply,
  provide_tasks,
  provide_turn,
} from './app/context.js';

import messages from '../messages_en.yaml';

import game from '../engine/game.js';

import './infobar.js';
import './supply.js';
import './tasks.js';

class App extends LitElement {
  #game;

  #messages;
  #supply;
  #tasks;
  #turn;

  constructor() {
    super();

    this.#game = createActor(game);

    this.#messages = provide_messages.apply(this);
    this.#supply = provide_supply.apply(this);
    this.#tasks = provide_tasks.apply(this);
    this.#turn = provide_turn.apply(this);

    this.#messages.setValue(messages);

    const game$ = observe_game(this.#game);

    observe_turn(game$).subscribe(turn => this.#turn.setValue(turn));
    observe_tasks(game$).subscribe(tasks => this.#tasks.setValue(tasks));
    observe_supply(game$).subscribe(supply => this.#supply.setValue(supply));

    this.addEventListener('task.selected', (e) => {
      this.#game.send({type: 'task.selected', ...e.detail});
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.#game.start();
  }

  render() {
    return html`
<agricola-infobar></agricola-infobar>
<agricola-supply></agricola-supply>
<agricola-tasks></agricola-tasks>
`;
  }
}

customElements.define('agricola-app', App);

