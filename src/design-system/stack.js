import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";
import { getComponentStoryMeta } from "../metadata/components.js";

class FableStack extends LitElement {
  static status = "stable";

  static properties = {
    alignItems: {
      type: String,
      reflect: true,
      attribute: "align-items",
      enum: ["start", "center", "end", "stretch"],
    },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      align-items: stretch;
    }
    :host([align-items="start"]) {
      align-items: flex-start;
    }
    :host([align-items="center"]) {
      align-items: center;
    }
    :host([align-items="end"]) {
      align-items: flex-end;
    }
    :host([align-items="stretch"]) {
      align-items: stretch;
    }
  `;

  constructor() {
    super();
    this.alignItems = "stretch";
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("fable-stack", FableStack);

// Stories
const meta = getComponentStoryMeta("stack", {});

const stories = {
  Default: (args) => html`
    <fable-stack align-items=${args.alignItems}>
      <fable-button variant="primary">Primary Button</fable-button>
      <fable-button variant="secondary">Secondary Button</fable-button>
      <fable-input label="Email" placeholder="Enter email"></fable-input>
      <fable-checkbox label="Subscribe to newsletter"></fable-checkbox>
    </fable-stack>
  `,
  "Form Controls": (_args) => html`
    <fable-card>
      <fable-stack>
        <h3>User Information</h3>
        <fable-input label="Full Name" placeholder="John Doe"></fable-input>
        <fable-input label="Email" placeholder="john@example.com"></fable-input>
        <fable-select label="Role">
          <fable-select-option value="admin">Admin</fable-select-option>
          <fable-select-option value="user">User</fable-select-option>
          <fable-select-option value="guest">Guest</fable-select-option>
        </fable-select>
        <fable-checkbox label="Active account"></fable-checkbox>
        <fable-button variant="primary">Save Changes</fable-button>
      </fable-stack>
    </fable-card>
  `,
  "Align Start": (_args) => html`
    <fable-stack align-items="start">
      <fable-button variant="primary">Short</fable-button>
      <fable-button variant="secondary">Medium Button</fable-button>
      <fable-button>Very Long Button Text Here</fable-button>
    </fable-stack>
  `,
  "Align Center": (_args) => html`
    <fable-stack align-items="center">
      <fable-button variant="primary">Short</fable-button>
      <fable-button variant="secondary">Medium Button</fable-button>
      <fable-button>Very Long Button Text Here</fable-button>
    </fable-stack>
  `,
  "Align End": (_args) => html`
    <fable-stack align-items="end">
      <fable-button variant="primary">Short</fable-button>
      <fable-button variant="secondary">Medium Button</fable-button>
      <fable-button>Very Long Button Text Here</fable-button>
    </fable-stack>
  `,
};

if (!window[STORIES_KEY]) window[STORIES_KEY] = [];
window[STORIES_KEY].push({ meta, stories });
