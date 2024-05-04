import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

class Supply extends LitElement {
  #supply;
  #messages;

  constructor() {
    super();

    this.#supply = new ContextConsumer(this, {
      context: 'supply',
      subscribe: true
    });

    this.#messages = new ContextConsumer(this, {
      context: 'messages',
    });
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

