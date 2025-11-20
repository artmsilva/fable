import { css, html, LitElement } from "lit";

class FablrSidebar extends LitElement {
  static status = "stable";

  static properties = {
    position: { type: String, reflect: true, enum: ["left", "right"] },
  };

  static styles = css`
    :host {
      display: block;
      padding-inline: var(--space-4);
      background-color: var(--bg-secondary);
      overflow-y: auto;
      border-right: 1px solid var(--border-color);
    }
    :host([position="right"]) {
      border-right: none;
      border-left: 1px solid var(--border-color);
    }
  `;

  constructor() {
    super();
    this.position = "left";
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("fablr-sidebar", FablrSidebar);

// Stories
const meta = {
  title: "Sidebar",
  component: "fablr-sidebar",
  args: {
    position: "left",
  },
  argTypes: {
    position: {
      control: "select",
      options: ["left", "right"],
    },
  },
};

const stories = {
  Default: (args) => html`
    <div
      style="display: flex; height: 400px; border: 1px solid var(--border-color);"
    >
      <fablr-sidebar position=${args.position}>
        <h3>Sidebar Content</h3>
        <fablr-nav-group title="Navigation">
          <fablr-link>Home</fablr-link>
          <fablr-link active>Dashboard</fablr-link>
          <fablr-link>Settings</fablr-link>
        </fablr-nav-group>
        <fablr-nav-group title="Reports">
          <fablr-link>Analytics</fablr-link>
          <fablr-link>Sales</fablr-link>
        </fablr-nav-group>
      </fablr-sidebar>
      <div style="flex: 1; padding: 20px; background: var(--bg-primary);">
        <p>Main content area</p>
      </div>
    </div>
  `,
  "Right Position": (args) => html`
    <div
      style="display: flex; height: 400px; border: 1px solid var(--border-color);"
    >
      <div style="flex: 1; padding: 20px; background: var(--bg-primary);">
        <p>Main content area</p>
      </div>
      <fablr-sidebar position="right">
        <h3>Controls</h3>
        <fablr-stack gap="var(--space-4)">
          <fablr-input label="Name" value="John Doe"></fablr-input>
          <fablr-checkbox label="Active" checked></fablr-checkbox>
          <fablr-button variant="primary">Save</fablr-button>
        </fablr-stack>
      </fablr-sidebar>
    </div>
  `,
  "With Nav Groups": (args) => html`
    <div
      style="display: flex; height: 400px; border: 1px solid var(--border-color);"
    >
      <fablr-sidebar position=${args.position}>
        <h2 style="margin-top: 0;">Documentation</h2>
        <fablr-nav-group title="Getting Started">
          <fablr-link>Introduction</fablr-link>
          <fablr-link>Installation</fablr-link>
          <fablr-link>Quick Start</fablr-link>
        </fablr-nav-group>
        <fablr-nav-group title="Components">
          <fablr-link>Button</fablr-link>
          <fablr-link>Input</fablr-link>
          <fablr-link>Card</fablr-link>
        </fablr-nav-group>
      </fablr-sidebar>
      <div style="flex: 1; padding: 20px; background: var(--bg-primary);">
        <p>Documentation content</p>
      </div>
    </div>
  `,
};

if (!window.__FABLR_STORIES__) window.__FABLR_STORIES__ = [];
window.__FABLR_STORIES__.push({ meta, stories });
