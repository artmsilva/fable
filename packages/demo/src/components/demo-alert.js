import { define } from "fable-workbench";
import { css, html, LitElement } from "lit";

class DemoAlert extends LitElement {
  static title = "Alert";
  static description = "Contextual feedback banner with dismissible option.";
  static status = "beta";
  static taxonomy = { group: "Feedback", category: "Notifications", tags: ["alert", "banner"] };

  static properties = {
    variant: { type: String, reflect: true, enum: ["info", "success", "warning", "error"] },
    dismissible: { type: Boolean },
    _dismissed: { state: true },
  };

  static args = { variant: "info", dismissible: false };
  static argTypes = {
    variant: { control: "select", options: ["info", "success", "warning", "error"] },
  };
  static slots = { default: "This is an alert message." };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }
    .alert {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--space-2);
      border-left: 3px solid var(--alert-color);
      background: var(--alert-bg);
      color: var(--text-primary);
      font-family: var(--font-stack);
      font-size: var(--font-body);
      line-height: 1.5;
    }
    :host([variant="info"]) {
      --alert-color: var(--primary-color);
      --alert-bg: color-mix(in srgb, var(--primary-color) 8%, var(--bg-primary));
    }
    :host([variant="success"]) {
      --alert-color: #2d8a56;
      --alert-bg: color-mix(in srgb, #2d8a56 8%, var(--bg-primary));
    }
    :host([variant="warning"]) {
      --alert-color: #b54708;
      --alert-bg: color-mix(in srgb, #b54708 8%, var(--bg-primary));
    }
    :host([variant="error"]) {
      --alert-color: #dc3545;
      --alert-bg: color-mix(in srgb, #dc3545 8%, var(--bg-primary));
    }
    .icon { flex-shrink: 0; font-size: 1.1em; }
    .content { flex: 1; }
    .dismiss {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 1rem;
      padding: 0;
      line-height: 1;
    }
    .dismiss:hover { color: var(--text-primary); }
  `;

  static stories = {
    Default: (args, slots) =>
      html`<demo-alert variant=${args.variant} ?dismissible=${args.dismissible}>${slots?.default ?? "This is an alert message."}</demo-alert>`,
    Success: {
      args: (base) => ({ ...base, variant: "success" }),
      lockedArgs: { variant: true },
      render: (args) =>
        html`<demo-alert variant="success" ?dismissible=${args.dismissible}>Changes saved successfully.</demo-alert>`,
    },
    Warning: {
      args: (base) => ({ ...base, variant: "warning" }),
      lockedArgs: { variant: true },
      render: (args) =>
        html`<demo-alert variant="warning" ?dismissible=${args.dismissible}>Your session expires in 5 minutes.</demo-alert>`,
    },
    Error: {
      args: (base) => ({ ...base, variant: "error" }),
      lockedArgs: { variant: true },
      render: (args) =>
        html`<demo-alert variant="error" ?dismissible=${args.dismissible}>Something went wrong. Please try again.</demo-alert>`,
    },
    Dismissible: {
      args: (base) => ({ ...base, dismissible: true }),
      lockedArgs: { dismissible: true },
      render: () =>
        html`<demo-alert variant="info" dismissible>This alert can be dismissed.</demo-alert>`,
    },
  };

  constructor() {
    super();
    this.variant = "info";
    this.dismissible = false;
    this._dismissed = false;
  }

  _icons = { info: "\u2139\uFE0F", success: "\u2705", warning: "\u26A0\uFE0F", error: "\u274C" };

  _dismiss() {
    this._dismissed = true;
    this.dispatchEvent(new CustomEvent("dismiss"));
  }

  render() {
    if (this._dismissed) return null;
    return html`
      <div class="alert" role="alert">
        <span class="icon">${this._icons[this.variant] ?? this._icons.info}</span>
        <div class="content"><slot></slot></div>
        ${this.dismissible
          ? html`<button class="dismiss" @click=${this._dismiss} aria-label="Dismiss">\u00D7</button>`
          : null}
      </div>
    `;
  }
}

define("demo-alert", DemoAlert);
