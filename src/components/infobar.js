import {LitElement, css, html} from 'lit';
import {consume_turn, consume_messages} from './app/context.js';

class InfoBar extends LitElement {
  #messages;
  #turn;

  constructor() {
    super();
    this.#messages = consume_messages.apply(this);
    this.#turn = consume_turn.apply(this);
  }

  render() {
    const msg_turn = () => {
      const turn = this.#turn.value;
      return this.#messages.value.turn({turn});
    };

    return html`<span>${msg_turn()}</span>`;
  }
}

customElements.define('agricola-infobar', InfoBar);
