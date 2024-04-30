import {LitElement, css, html} from 'lit';
import {consume_turn} from './app/context.js';

class InfoBar extends LitElement {
  #turn;

  constructor() {
    super();
    this.#turn = consume_turn.apply(this);
  }

  render() {
    return html`<span>turn (${this.#turn.value})</span>`;
  }
}

customElements.define('agricola-infobar', InfoBar);
