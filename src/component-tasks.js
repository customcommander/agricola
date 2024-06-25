import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';
import {map} from 'lit/directives/map.js';

class Tasks extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(18, 3rem);
      grid-template-areas:
        ".     head1"
        "t101  t111 "
        "t102  t112 "
        "t103  t113 "
        "t104  t114 "
        "t105  .    "
        "t106  head2"
        "t107  t115 "
        "t108  t116 "
        "t109  t117 "
        "t110  .    "
        "head3 head4"
        "t118  t120 "
        "t119  t121 "
        ".     .    "
        "head5 head6"
        "t122  t124 "
        "t123  .    ";
    }

    #t101 {grid-area: t101}
    #t102 {grid-area: t102}
    #t103 {grid-area: t103}
    #t104 {grid-area: t104}
    #t105 {grid-area: t105}
    #t106 {grid-area: t106}
    #t107 {grid-area: t107}
    #t108 {grid-area: t108}
    #t109 {grid-area: t109}
    #t110 {grid-area: t110}
    #t111 {grid-area: t111}
    #t112 {grid-area: t112}
    #t113 {grid-area: t113}
    #t114 {grid-area: t114}
    #t115 {grid-area: t115}
    #t116 {grid-area: t116}
    #t117 {grid-area: t117}
    #t118 {grid-area: t118}
    #t119 {grid-area: t119}
    #t120 {grid-area: t120}
    #t121 {grid-area: t121}
    #t122 {grid-area: t122}
    #t123 {grid-area: t123}
    #t124 {grid-area: t124}

    div {}

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
      <div id="t${id}"
           ?selected=${t.selected}
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

