import {LitElement, css, html} from 'lit';
import {consume_supply, consume_messages} from './app/context.js';

class Supply extends LitElement {
  #supply;
  #messages;

  constructor() {
    super();
    this.#supply = consume_supply.apply(this);
    this.#messages = consume_messages.apply(this);
  }

  render() {
    const {wood, reed, clay} = this.#supply.value;
    const msg = this.#messages.value;
    return html`
<div>
<span>${msg.supply_wood({qty: wood})}</span>
<span>${msg.supply_reed({qty: reed})}</span>
<span>${msg.supply_clay({qty: clay})}</span>
</div>
`;
  }
}

customElements.define('agricola-supply', Supply);

