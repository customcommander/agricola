import {LitElement, css, html} from 'lit';

import {createActor} from 'xstate';

import {
  observe_game,
  supply$,
  tasks$,
  turn$,
} from '../observables.js';

import {ContextProvider} from '@lit/context';

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

    const provide = context => new ContextProvider(this, {context});

    this.#game = createActor(game);

    this.#messages = provide('messages');
    this.#supply = provide('supply');
    this.#tasks = provide('tasks');
    this.#turn = provide('turn');

    this.#messages.setValue(messages);

    const game$ = observe_game(this.#game);

    const observe = (fn, cb) => fn(game$).subscribe(cb);

    observe(turn$, turn => this.#turn.setValue(turn));
    observe(tasks$, tasks => this.#tasks.setValue(tasks));
    observe(supply$, supply => this.#supply.setValue(supply));

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

