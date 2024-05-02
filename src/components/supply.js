import {LitElement, css, html} from 'lit';
import {consume_supply} from './app/context.js';

class Supply extends LitElement {
  #supply;

  constructor() {
    super();
    this.#supply = consume_supply.apply(this);
  }

  render() {
    return html`
<div>
<span>wood: ${this.#supply.value.wood}</span>
<span>reed: ${this.#supply.value.reed}</span>
<span>clay: ${this.#supply.value.clay}</span>
</div>
`;
  }
}

customElements.define('agricola-supply', Supply);

