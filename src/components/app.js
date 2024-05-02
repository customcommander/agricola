import {LitElement, css, html} from 'lit';

import {createActor} from 'xstate';

import {
  Subject,
  distinct,
  fromEventPattern,
  map,
  multicast,
  refCount,
  distinctUntilChanged,
} from 'rxjs';

import deep_equal from 'fast-deep-equal';

import {
  provide_turn,
  provide_tasks,
} from './app/context.js';

import game from '../engine/game.js';

import './infobar.js';
import './tasks.js';

class App extends LitElement {
  #game;
  #snapshot$;
  #turn;
  #tasks;

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
    this.#provideTasks();
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

  #provideTasks() {
    this.#tasks = provide_tasks.apply(this);

    this.#snapshot$
      .pipe(
        map(snapshot => snapshot.context.tasks),
        distinctUntilChanged(deep_equal)
      )
      .subscribe(tasks => {
        this.#tasks.setValue(tasks);
      });
  }

  connectedCallback() {
    super.connectedCallback();
    this.#game.start();
  }

  render() {
    return html`
<agricola-infobar></agricola-infobar>
<agricola-tasks></agricola-tasks>
`;
  }
}

customElements.define('agricola-app', App);

