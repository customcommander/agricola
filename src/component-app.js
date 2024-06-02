import {LitElement, css, html} from 'lit';

import {
  observe_game,
  early_exit$,
  error$,
  farmyard$,
  selection$,
  supply$,
  tasks$,
  turn$,
} from './observables.js';

import {ContextProvider} from '@lit/context';

import messages from './messages_en.yaml';

import game from './game.js';

import './component-error.js';
import './component-infobar.js';
import './component-supply.js';
import './component-tasks.js';
import './component-farmyard.js';

class App extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      grid-template-areas:
        "info   info     info"
        "supply supply   supply"
        "tasks  farmyard improvements"
        "score  score    score";
    }

    agricola-infobar {
      grid-area: info;
    }

    agricola-supply {
      grid-area: supply;
    }

    agricola-tasks {
      grid-area: tasks;
    }

    agricola-farmyard {
      grid-area: farmyard;
    }
  `;

  #game;
  #messages;

  #early_exit;
  #error;
  #farmyard;
  #selection;
  #supply;
  #tasks;
  #turn;

  constructor() {
    super();

    this.#game = game;

    const provide = context => new ContextProvider(this, {context});

    this.#messages = provide('messages');

    this.#early_exit = provide('early_exit');
    this.#error = provide('error');
    this.#farmyard = provide('farmyard');
    this.#selection = provide('selection');
    this.#supply = provide('supply');
    this.#tasks = provide('tasks');
    this.#turn = provide('turn');

    this.#messages.setValue(messages);

    const game$ = observe_game(this.#game);
    const observe = (fn, cb) => fn(game$).subscribe(cb);

    observe(early_exit$, early_exit => this.#early_exit.setValue(early_exit));
    observe(error$, error => this.#error.setValue(error));
    observe(farmyard$, farmyard => this.#farmyard.setValue(farmyard));
    observe(selection$, selection => this.#selection.setValue(selection));
    observe(supply$, supply => this.#supply.setValue(supply));
    observe(tasks$, tasks => this.#tasks.setValue(tasks));
    observe(turn$, turn => this.#turn.setValue(turn));

    this.addEventListener('dispatch', (e) => this.#game.send(e.detail));
  }

  connectedCallback() {
    super.connectedCallback();
    this.#game.subscribe(snap => {
      console.log(snap.value);
    });
    this.#game.start();
  }

  render() {
    return html`
      <agricola-error></agricola-error>
      <agricola-infobar></agricola-infobar>
      <agricola-supply></agricola-supply>
      <agricola-tasks></agricola-tasks>
      <agricola-farmyard></agricola-farmyard>
    `;
  }
}

customElements.define('agricola-app', App);

