import { css, html, LitElement } from "lit";

class FablrHeader extends LitElement {
  static status = "stable";

  static properties = {
    align: { type: String, reflect: true, enum: ["start", "center", "end"] },
  };

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-left: var(--space-4);
      border-bottom: 1px solid var(--border-color);
    }
    :host([align="start"]) {
      align-items: flex-start;
    }
    :host([align="center"]) {
      align-items: center;
    }
    :host([align="end"]) {
      align-items: flex-end;
    }
  `;

  constructor() {
    super();
    this.align = "center";
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("fablr-header", FablrHeader);

// Stories
const meta = {
  title: "Header",
  component: "fablr-header",
  args: {
    align: "center",
  },
  argTypes: {
    align: {
      control: "select",
      options: ["start", "center", "end"],
    },
  },
};

const stories = {
  Default: (args) => html`
    <fablr-header align=${args.align}>
      <h3>Component Title</h3>
      <fablr-badge variant="stable">stable</fablr-badge>
    </fablr-header>
  `,
  "Page Header": (args) => html`
    <fablr-header align=${args.align}>
      <h2>Dashboard</h2>
      <fablr-badge variant="info">3 notifications</fablr-badge>
      <fablr-button variant="primary">New Item</fablr-button>
    </fablr-header>
  `,
  "With Icons": (args) => html`
    <fablr-header align=${args.align}>
      <fablr-icon-button>⬅️</fablr-icon-button>
      <h3>Settings</h3>
      <fablr-icon-button>✏️</fablr-icon-button>
      <fablr-icon-button>🗑️</fablr-icon-button>
    </fablr-header>
  `,
  "Status Header": (args) => html`
    <fablr-header align=${args.align}>
      <h3>fablr-button — Default</h3>
      <fablr-badge variant="stable">stable</fablr-badge>
      <fablr-badge variant="info">v2.0</fablr-badge>
    </fablr-header>
  `,
  "Align Start": (args) => html`
    <fablr-header align="start">
      <h3>Tall Title</h3>
      <fablr-badge variant="beta">beta</fablr-badge>
      <fablr-button variant="secondary">Action</fablr-button>
    </fablr-header>
  `,
  "Align End": (args) => html`
    <fablr-header align="end">
      <h3>Tall Title</h3>
      <fablr-badge variant="alpha">alpha</fablr-badge>
      <fablr-button variant="secondary">Action</fablr-button>
    </fablr-header>
  `,
};

if (!window.__FABLR_STORIES__) window.__FABLR_STORIES__ = [];
window.__FABLR_STORIES__.push({ meta, stories });
