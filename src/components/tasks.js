import {LitElement, css, html} from 'lit';
import {map} from 'lit/directives/map.js';
import {consume_tasks} from './app/context.js';

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

  constructor() {
    super();
    this.#tasks = consume_tasks.apply(this);
  }

  createRenderRoot() {
    const root = super.createRenderRoot();

    root.addEventListener('click', function (e) {
      const already_selected = e.target.hasAttribute('selected');

      if (already_selected) return;

      this.dispatchEvent(
        new CustomEvent('task.selected', {
          bubbles: true,
          composed: true,
          detail: {
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
				${t.id} -> (${t.quantity})
			</div>
		`;

    return html`${map(this.#tasks.value, task)}`;
  }
}

customElements.define('agricola-tasks', Tasks);

