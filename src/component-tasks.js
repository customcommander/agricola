import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';
import {map} from 'lit/directives/map.js';

class Tasks extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      row-gap: 1em;
    }

    li {
      white-space: pre-wrap;
      border: 1px solid black;
      list-style-type: none;
    }

    li:not([selected]) {
      cursor: pointer;
    }

    li[selected] {
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
      <li ?selected=${t.selected}
          @click=${t.selected || t.hidden ? null : () => this._notify(id)}>
        ${t.hidden ? msg['task-not-avail']({turn: t.turn}) : msg[id]({qty: t.quantity})}
      </li>
    `;

    return html`
      <ol>
        ${map(tasks, task)}
      </ol>
    `;
  }
}

customElements.define('agricola-tasks', Tasks);

