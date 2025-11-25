import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";

class FableCard extends LitElement {
  static status = "stable";

  static properties = {
    title: { type: String },
  };

  static styles = css`
    :host {
      display: inline-grid;
      margin-bottom: var(--space-4);
      border: 1px solid var(--border-color);
      padding: var(--space-4);
      border-radius: var(--space-2);
      background: var(--bg-primary);
      box-shadow: 0 1px 2px var(--shadow-color);
      font-family: var(--font-stack);
    }
    .title {
      font-weight: 600;
      margin-bottom: var(--space-2);
      font-size: var(--font-body);
      color: var(--text-primary);
    }
    .content {
      color: var(--text-secondary);
      font-size: var(--font-body);
    }
  `;

  constructor() {
    super();
    this.title = "";
  }

  render() {
    return html`
      ${this.title ? html`<div class="title">${this.title}</div>` : ""}
      <div class="content"><slot></slot></div>
    `;
  }
}

customElements.define("fable-card", FableCard);

// Stories
const meta = {
  component: "fable-card",
  args: { title: "Card Title" },
  slots: {
    default: "This is a card content.",
  },
};
const stories = {
  Default: (args, slots) =>
    html`<fable-card title=${args.title}
      >${slots?.default ?? "This is a card content."}</fable-card
    >`,
};

window[STORIES_KEY] = window[STORIES_KEY] || [];
window[STORIES_KEY].push({ meta, stories });
