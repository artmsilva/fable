import { css, html, LitElement } from "lit";

class FablrCard extends LitElement {
  static properties = {
    title: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      --card-bg-color: #fff;
      --card-border-color: var(--secondary-color);
      margin-bottom: var(--space-4);
    }
    .card {
      border: 1px solid var(--card-border-color);
      padding: var(--space-4);
      border-radius: var(--space-2);
      background: var(--card-bg-color);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
      font-family: var(--font-stack);
    }
    .title {
      font-weight: 600;
      margin-bottom: var(--space-2);
      font-size: var(--font-body);
      color: color-mix(in srgb, var(--secondary-color) 90%, black);
    }
    .content {
      color: color-mix(in srgb, var(--secondary-color) 80%, black);
      font-size: var(--font-body);
    }
  `;

  constructor() {
    super();
    this.title = "";
  }

  render() {
    return html`
      <div class="card">
        ${this.title ? html`<div class="title">${this.title}</div>` : ""}
        <div class="content"><slot></slot></div>
      </div>
    `;
  }
}

customElements.define("fablr-card", FablrCard);

// Stories
const meta = {
  title: "Fablr Card",
  component: "fablr-card",
  args: { title: "Card Title" },
  slots: {
    default: "This is a card content.",
  },
};
const stories = {
  Default: (args, slots) =>
    html`<fablr-card title=${args.title}
      >${slots?.default ?? "This is a card content."}</fablr-card
    >`,
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
