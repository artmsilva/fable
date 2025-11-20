import { css, html, LitElement } from "lit";

class FablrStack extends LitElement {
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

customElements.define("fablr-stack", FablrStack);

// Stories
const meta = {
  component: "fablr-stack",
};

const stories = {
  Default: (args) => html`
    <fablr-stack align-items=${args.alignItems}>
      <fablr-button variant="primary">Primary Button</fablr-button>
      <fablr-button variant="secondary">Secondary Button</fablr-button>
      <fablr-input label="Email" placeholder="Enter email"></fablr-input>
      <fablr-checkbox label="Subscribe to newsletter"></fablr-checkbox>
    </fablr-stack>
  `,
  "Form Controls": (args) => html`
    <fablr-card>
      <fablr-stack>
        <h3>User Information</h3>
        <fablr-input label="Full Name" placeholder="John Doe"></fablr-input>
        <fablr-input label="Email" placeholder="john@example.com"></fablr-input>
        <fablr-select label="Role">
          <fablr-select-option value="admin">Admin</fablr-select-option>
          <fablr-select-option value="user">User</fablr-select-option>
          <fablr-select-option value="guest">Guest</fablr-select-option>
        </fablr-select>
        <fablr-checkbox label="Active account"></fablr-checkbox>
        <fablr-button variant="primary">Save Changes</fablr-button>
      </fablr-stack>
    </fablr-card>
  `,
  "Align Start": (args) => html`
    <fablr-stack align-items="start">
      <fablr-button variant="primary">Short</fablr-button>
      <fablr-button variant="secondary">Medium Button</fablr-button>
      <fablr-button>Very Long Button Text Here</fablr-button>
    </fablr-stack>
  `,
  "Align Center": (args) => html`
    <fablr-stack align-items="center">
      <fablr-button variant="primary">Short</fablr-button>
      <fablr-button variant="secondary">Medium Button</fablr-button>
      <fablr-button>Very Long Button Text Here</fablr-button>
    </fablr-stack>
  `,
  "Align End": (args) => html`
    <fablr-stack align-items="end">
      <fablr-button variant="primary">Short</fablr-button>
      <fablr-button variant="secondary">Medium Button</fablr-button>
      <fablr-button>Very Long Button Text Here</fablr-button>
    </fablr-stack>
  `,
};

if (!window.__FABLR_STORIES__) window.__FABLR_STORIES__ = [];
window.__FABLR_STORIES__.push({ meta, stories });
