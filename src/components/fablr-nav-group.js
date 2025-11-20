import { css, html, LitElement } from "lit";

class FablrNavGroup extends LitElement {
  static status = "stable";

  static properties = {
    title: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      margin-bottom: 16px;
    }
    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      overflow: visible;
    }
    ::slotted(*) {
      display: block;
    }
  `;

  constructor() {
    super();
    this.title = "";
  }

  render() {
    return html`
      <div class="nav-group">
        <div class="nav-title">
          ${this.title ? this.title : ""}
          <slot name="title"></slot>
        </div>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("fablr-nav-group", FablrNavGroup);

// Stories
const meta = {
  title: "Nav Group",
  component: "fablr-nav-group",
  args: {
    title: "Components",
  },
};

const stories = {
  Default: (args) => html`
    <fablr-nav-group title=${args.title}>
      <fablr-link>Button</fablr-link>
      <fablr-link active>Input</fablr-link>
      <fablr-link>Card</fablr-link>
      <fablr-link>Select</fablr-link>
    </fablr-nav-group>
  `,
  "Without Title": (args) => html`
    <fablr-nav-group>
      <fablr-link>Home</fablr-link>
      <fablr-link>About</fablr-link>
      <fablr-link>Contact</fablr-link>
    </fablr-nav-group>
  `,
  "Multiple Groups": (args) => html`
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <fablr-nav-group title="Forms">
        <fablr-link>Button</fablr-link>
        <fablr-link>Input</fablr-link>
        <fablr-link>Checkbox</fablr-link>
      </fablr-nav-group>
      <fablr-nav-group title="Layout">
        <fablr-link>Card</fablr-link>
        <fablr-link>Stack</fablr-link>
        <fablr-link>Sidebar</fablr-link>
      </fablr-nav-group>
    </div>
  `,
};

if (!window.__FABLR_STORIES__) window.__FABLR_STORIES__ = [];
window.__FABLR_STORIES__.push({ meta, stories });
