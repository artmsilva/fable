import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";
import { getComponentStoryMeta } from "../metadata/components.js";

class FableNavGroup extends LitElement {
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

customElements.define("fable-nav-group", FableNavGroup);

// Stories
const meta = getComponentStoryMeta("nav-group", {
  args: {
    title: "Components",
  },
});

const stories = {
  Default: (args) => html`
    <fable-nav-group title=${args.title}>
      <fable-link>Button</fable-link>
      <fable-link active>Input</fable-link>
      <fable-link>Card</fable-link>
      <fable-link>Select</fable-link>
    </fable-nav-group>
  `,
  "Without Title": (_args) => html`
    <fable-nav-group>
      <fable-link>Home</fable-link>
      <fable-link>About</fable-link>
      <fable-link>Contact</fable-link>
    </fable-nav-group>
  `,
  "Multiple Groups": (_args) => html`
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <fable-nav-group title="Forms">
        <fable-link>Button</fable-link>
        <fable-link>Input</fable-link>
        <fable-link>Checkbox</fable-link>
      </fable-nav-group>
      <fable-nav-group title="Layout">
        <fable-link>Card</fable-link>
        <fable-link>Stack</fable-link>
        <fable-link>Sidebar</fable-link>
      </fable-nav-group>
    </div>
  `,
};

if (!window[STORIES_KEY]) window[STORIES_KEY] = [];
window[STORIES_KEY].push({ meta, stories });
