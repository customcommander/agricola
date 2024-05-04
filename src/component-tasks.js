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

    div {
      border: 1px solid black;
    }

    div:not([selected]) {
      cursor: pointer;
    }

    div[selected] {
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

  createRenderRoot() {
    const root = super.createRenderRoot();

    root.addEventListener('click', function (e) {
      const already_selected = e.target.hasAttribute('selected');

      if (already_selected) return;

      this.dispatchEvent(
        new CustomEvent('dispatch', {
          bubbles: true,
          composed: true,
          detail: {
            type: 'task.selected',
            task_id: e.target.id
          }
        })
      );
    });

    return root;
  }

  render() {
    const task = t => html`
      <div id=${t.id} ?selected=${t.selected}>
        ${this.#messages.value[t.id]({qty: t.quantity})}
      </div>
    `;

    return html`${map(this.#tasks.value, task)}`;
  }
}

customElements.define('agricola-tasks', Tasks);

