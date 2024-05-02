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
  provide_supply,
  provide_tasks,
  provide_turn,
} from './app/context.js';

import game from '../engine/game.js';

import './infobar.js';
import './supply.js';
import './tasks.js';

class App extends LitElement {
  #game;
  #snapshot$;
  #turn;
  #supply;
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

    this.#provide_turn();
    this.#provide_supply();
    this.#provide_tasks();

    this.addEventListener('task.selected', (e) => {
      this.#game.send({type: 'task.selected', ...e.detail});
    });

  }

  #provide_turn() {
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

  #provide_tasks() {
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

  #provide_supply() {
    this.#supply = provide_supply.apply(this);

    this.#snapshot$
      .pipe(
        map(snapshot => snapshot.context.supply),
        distinctUntilChanged(deep_equal)
      )
      .subscribe(supply => {
        this.#supply.setValue(supply);
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

