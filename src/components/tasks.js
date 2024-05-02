import {LitElement, css, html} from 'lit';
import {map} from 'lit/directives/map.js';
import {consume_tasks} from './app/context.js';

class Tasks extends LitElement {
  #tasks;

  constructor() {
    super();
    this.#tasks = consume_tasks.apply(this);
  }

  render() {
    return html`

<ol>
${map(this.#tasks.value, t => html`<li>${t.id} (${t.quantity})</li>`)}
</ol>

`;
  }
}

customElements.define('agricola-tasks', Tasks);

