import {LitElement, css, html} from 'lit';
import {createActor} from 'xstate';

import {provide_turn} from './app/context.js';

import game from '../engine/game.js';

import './infobar.js';

class App extends LitElement {
  #game;
  #turn;

  constructor() {
    super();
    this.#game = createActor(game);
    this.#turn = provide_turn.apply(this);
  }

  connectedCallback() {
    super.connectedCallback();

    this.#game.on('new_turn', (e) => {
      this.#turn.setValue(e.turn);
    });

    this.#game.start();
  }

  render() {
    return html`<agricola-infobar></agricola-infobar>`;
  }

}

customElements.define('agricola-app', App);

