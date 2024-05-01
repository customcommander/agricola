import {LitElement, css, html} from 'lit';

import {createActor} from 'xstate';

import {
  Subject,
  distinct,
  fromEventPattern,
  map,
  multicast,
  refCount,
} from 'rxjs';

import {provide_turn} from './app/context.js';

import game from '../engine/game.js';

import './infobar.js';

class App extends LitElement {
  #game;
  #snapshot$;
  #turn;

  constructor() {
    super();

    this.#game = createActor(game);

    const subject = new Subject();

    this.#snapshot$ =
      fromEventPattern(
        (handler) => this.#game.subscribe(handler),
        (_, subscription) => subscription.unsubscribe()
      )
      .pipe(
        multicast(subject),
        refCount()
      );

    this.#provideTurn();
  }

  #provideTurn() {
    this.#turn = provide_turn.apply(this);

    this.#snapshot$
      .pipe(
        map(snapshot => snapshot.context.turn),
        distinct()
      )
      .subscribe(turn => {
        this.#turn.setValue(turn);
      });
  }

  connectedCallback() {
    super.connectedCallback();
    this.#game.start();
  }

  render() {
    return html`<agricola-infobar></agricola-infobar>`;
  }
}

customElements.define('agricola-app', App);

