import { html, LitElement } from "lit";

export class FableChipGroup extends LitElement {
  static properties = {
    chips: { type: Array },
    active: { type: String },
  };

  constructor() {
    super();
    this.chips = [];
    this.active = "all";
    this.style.display = "block";
  }

  createRenderRoot() {
    return this;
  }

  _handleClick(value) {
    this.active = value;
    this.dispatchEvent(
      new CustomEvent("chip-select", {
        detail: { value },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const chips = [{ id: "all", label: "All", count: this.totalCount }, ...this.chips];
    return html`
      <div class="home-chip-group">
        ${chips.map(
          (chip) => html`
            <button
              class="home-chip"
              type="button"
              aria-pressed=${this.active === chip.id}
              @click=${() => this._handleClick(chip.id)}
            >
              <span class="home-chip-label">${chip.label}</span>
              <span class="home-chip-count">${chip.count}</span>
            </button>
          `
        )}
      </div>
    `;
  }

  get totalCount() {
    return this.chips.reduce((acc, chip) => acc + (chip.count || 0), 0);
  }
}

customElements.define("fable-chip-group", FableChipGroup);
