import { html, LitElement } from "lit";

const formatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export class FableHomeActivity extends LitElement {
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

  _formatDate(value) {
    if (!value) return "—";
    return formatter.format(new Date(value));
  }

  render() {
    if (!this.items.length) {
      return html`<p>No recent activity yet.</p>`;
    }

    return html`
      <ul class="home-activity-list">
        ${this.items.map(
          (item) => html`
            <li class="home-activity-item">
              <div class="home-activity-details">
                <h4 class="home-activity-title">${item.title}</h4>
                <div class="home-activity-meta">
                  Updated ${this._formatDate(item.updatedAt)} •
                  ${item.taxonomy?.status || "beta"}
                </div>
                <div class="home-activity-tags">
                  ${(item.taxonomy?.tags || []).map(
                    (tag) => html`<span class="home-activity-tag">${tag}</span>`
                  )}
                </div>
              </div>
              <a class="home-activity-link" href=${item.href || "#"}
                >View story</a
              >
            </li>
          `
        )}
      </ul>
    `;
  }
}

customElements.define("fable-home-activity", FableHomeActivity);
