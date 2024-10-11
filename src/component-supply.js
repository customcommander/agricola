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
    const {food, grain, wood, reed, clay, stone} = this.#supply.value;
    const msg = this.#messages.value;
    return html`
      <div>
        <span>${msg.supply_food({qty: food})}</span>
        <span>${msg.supply_grain({qty: grain})}</span>
        <span>${msg.supply_wood({qty: wood})}</span>
        <span>${msg.supply_reed({qty: reed})}</span>
        <span>${msg.supply_clay({qty: clay})}</span>
        <span>${msg.supply_stone({qty: stone})}</span>
      </div>
    `;
  }
}

customElements.define('agricola-supply', Supply);

