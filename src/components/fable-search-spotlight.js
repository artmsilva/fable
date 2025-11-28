import { html, LitElement } from "lit";

export class FableSearchSpotlight extends LitElement {
  static properties = {
    items: { type: Array },
  };

  constructor() {
    super();
    this.items = [];
    this.style.display = "block";
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <ul class="search-spotlight-list">
        ${this.items.map(
          (item) => html`
            <li class="search-spotlight-item">
              <strong class="search-spotlight-title"
                >Search “${item.query}”</strong
              >
              <p class="search-spotlight-description">${item.description}</p>
              <a class="search-spotlight-link" href=${item.href || "#"}>Open</a>
            </li>
          `
        )}
      </ul>
    `;
  }
}

customElements.define("fable-search-spotlight", FableSearchSpotlight);
