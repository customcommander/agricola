import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

class InfoBar extends LitElement {
  #early_exit;
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

    this.#early_exit = new ContextConsumer(this, {
      context: 'early_exit',
      subscribe: true
    });
  }

  _dispatch(task_id) {
    this.dispatchEvent(
      new CustomEvent('dispatch', {
        bubbles: true,
        composed: true,
        detail: {
          type: 'task.exit',
          task_id
        }
      })
    );
  }

  _early_exit() {
    const early_exit = this.#early_exit.value;
    if (!early_exit) return;
    return html`
      <button type="button" @click=${() => this._dispatch(early_exit)}>
        ${this.#messages.value.complete()}
      </button>
    `;
  }

  render() {
    const msg = this.#messages.value;
    const {turn, workers} = this.#turn.value;
    return html`
      <span>${msg.turn({turn})}</span>
      <span title=${msg.num_workers_description({num: workers})}>
        ${msg.num_workers({num:workers})}
      </span>
      ${this._early_exit()}
    `;
  }
}

customElements.define('agricola-infobar', InfoBar);

