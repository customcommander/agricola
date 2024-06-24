import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';
import {map} from 'lit/directives/map.js';

class Tasks extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      grid-template-rows: repeat(4, 1fr);
    }

    div {
    }

    div:not([selected]) {
      cursor: pointer;
    }

    div[selected],
    div[masked] {
      opacity: 0.2;
      cursor: not-allowed;
    }
  `;

  #tasks;
  #messages;

  constructor() {
    super();

    this.#tasks = new ContextConsumer(this, {
      context: 'tasks',
      subscribe: true
    });

    this.#messages = new ContextConsumer(this, {
      context: 'messages'
    });
  }

  _notify(task_id) {
    this.dispatchEvent(
      new CustomEvent('dispatch', {
        bubbles: true,
        composed: true,
        detail: {
          type: 'task.selected',
          task_id
        }
      })
    );
  }

  render() {
    const msg = this.#messages.value;
    const tasks = Object.entries(this.#tasks.value);
    
    const task = ([id, t]) => html`
      <div ?selected=${t.selected}
          ?masked=${t.hidden === true}
          @click=${t.selected || t.hidden ? null : () => this._notify(id)}>
        ${t.hidden ? msg['task-not-avail']({turn: t.turn}) : msg[id]({qty: t.quantity})}
      </div>
    `;

    return html`
        ${map(tasks, task)}
    `;
  }
}

customElements.define('agricola-tasks', Tasks);

