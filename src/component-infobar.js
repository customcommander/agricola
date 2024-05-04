import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

class InfoBar extends LitElement {
  #messages;
  #turn;

  constructor() {
    super();

    this.#messages = new ContextConsumer(this, {
      context: 'messages'
    });

    this.#turn = new ContextConsumer(this, {
      context: 'turn',
      subscribe: true
    });
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

