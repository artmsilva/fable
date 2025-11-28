import { html, LitElement } from "lit";

export class FableHomeCards extends LitElement {
  static properties = {
    cards: { type: Array },
  };

  constructor() {
    super();
    this.cards = [];
    this.style.display = "block";
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="home-cards-grid">
        ${this.cards.map(
          (card) => html`
            <article class="home-card">
              <span class="home-card-label">${card.accent}</span>
              <h3 class="home-card-title">${card.title}</h3>
              <p class="home-card-description">${card.description}</p>
              <a class="home-card-link" href=${card.href || "#"}>Open</a>
            </article>
          `
        )}
      </div>
    `;
  }
}

customElements.define("fable-home-cards", FableHomeCards);
