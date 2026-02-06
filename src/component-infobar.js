import {
  LitElement,
  css,
  html,
  nothing,
} from 'lit';

import {ContextConsumer} from '@lit/context';

class InfoBar extends LitElement {
  constructor() {
    super();
    this._consume('messages', {subscribe: false});
    this._consume('early_exit');
    this._consume('feed_phase');
    this._consume('turn');
  }

  _consume(context, opts = {}) {
    const {subscribe = true} = opts;
    this[`_${context}`] = new ContextConsumer(this, {context, subscribe});
  }

  _dispatch(ev) {
    this.dispatchEvent(
      new CustomEvent('player.move', {
        bubbles: true,
        composed: true,
        detail: ev
      })
    );
  }

  _render_early_exit_button() {
    const task_id = this._early_exit.value;

    if (!task_id) {
      return nothing;
    }

    const ev = {type: 'task.exit', task_id};

    return html`
      <button type="button" @click=${() => this._dispatch(ev)}>
        ${this._messages.value.complete()}
      </button>
    `;
  }

  _render_feed_button() {
    if (!this._feed_phase.value) {
      return nothing;
    }

    const ev = {type: 'task.feed', task_id: '002'};

    return html`
      <button type="button" @click=${() => this._dispatch(ev)}>
        ${this._messages.value.feed_family()}
      </button>
    `;
  }

  render() {
    const msg = this._messages.value;
    const {turn, workers} = this._turn.value;
    return html`
      <span>${msg.turn({turn})}</span>
      <span title=${msg.num_workers_description({num: workers})}>
        ${msg.num_workers({num:workers})}
      </span>
      ${this._render_early_exit_button()}
      ${this._render_feed_button()}
    `;
  }
}

customElements.define('agricola-infobar', InfoBar);

