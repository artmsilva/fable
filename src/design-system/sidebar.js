import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";
import { getComponentStoryMeta } from "../metadata/components.js";

class FableSidebar extends LitElement {
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

customElements.define("fable-sidebar", FableSidebar);

// Stories
const meta = getComponentStoryMeta("sidebar", {
  args: {
    position: "left",
  },
  argTypes: {
    position: {
      control: "select",
      options: ["left", "right"],
    },
  },
});

const stories = {
  Default: (args) => html`
    <div
      style="display: flex; height: 400px; border: 1px solid var(--border-color);"
    >
      <fable-sidebar position=${args.position}>
        <h3>Sidebar Content</h3>
        <fable-nav-group title="Navigation">
          <fable-link>Home</fable-link>
          <fable-link active>Dashboard</fable-link>
          <fable-link>Settings</fable-link>
        </fable-nav-group>
        <fable-nav-group title="Reports">
          <fable-link>Analytics</fable-link>
          <fable-link>Sales</fable-link>
        </fable-nav-group>
      </fable-sidebar>
      <div style="flex: 1; padding: 20px; background: var(--bg-primary);">
        <p>Main content area</p>
      </div>
    </div>
  `,
  "Right Position": (_args) => html`
    <div
      style="display: flex; height: 400px; border: 1px solid var(--border-color);"
    >
      <div style="flex: 1; padding: 20px; background: var(--bg-primary);">
        <p>Main content area</p>
      </div>
      <fable-sidebar position="right">
        <h3>Controls</h3>
        <fable-stack gap="var(--space-4)">
          <fable-input label="Name" value="John Doe"></fable-input>
          <fable-checkbox label="Active" checked></fable-checkbox>
          <fable-button variant="primary">Save</fable-button>
        </fable-stack>
      </fable-sidebar>
    </div>
  `,
  "With Nav Groups": (args) => html`
    <div
      style="display: flex; height: 400px; border: 1px solid var(--border-color);"
    >
      <fable-sidebar position=${args.position}>
        <h2 style="margin-top: 0;">Documentation</h2>
        <fable-nav-group title="Getting Started">
          <fable-link>Introduction</fable-link>
          <fable-link>Installation</fable-link>
          <fable-link>Quick Start</fable-link>
        </fable-nav-group>
        <fable-nav-group title="Components">
          <fable-link>Button</fable-link>
          <fable-link>Input</fable-link>
          <fable-link>Card</fable-link>
        </fable-nav-group>
      </fable-sidebar>
      <div style="flex: 1; padding: 20px; background: var(--bg-primary);">
        <p>Documentation content</p>
      </div>
    </div>
  `,
};

if (!window[STORIES_KEY]) window[STORIES_KEY] = [];
window[STORIES_KEY].push({ meta, stories });
