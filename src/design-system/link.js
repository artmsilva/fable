import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";

class FableLink extends LitElement {
  static status = "stable";

  static properties = {
    href: { type: String },
    active: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      display: contents;
    }
    a {
      color: var(--primary-color);
      text-decoration: none;
      cursor: pointer;
      padding: calc(var(--space-base)) var(--space-2);
      border-radius: var(--space-base);
      transition: background-color 0.2s;
      display: inline-block;
      font-size: var(--font-body);
      font-family: var(--font-stack);
    }
    a:hover {
      background-color: color-mix(
        in srgb,
        var(--primary-color) 10%,
        transparent
      );
      text-decoration: underline;
    }
    :host([active]) a {
      background-color: color-mix(
        in srgb,
        var(--primary-color) 15%,
        transparent
      );
      color: var(--primary-color);
      font-weight: 600;
    }
  `;

  constructor() {
    super();
    this.href = "";
    this.active = false;
  }

  _handleClick(e) {
    e.preventDefault();

    if (this.href) {
      // Dispatch custom navigation event that the router can listen to
      this.dispatchEvent(
        new CustomEvent("navigate", {
          detail: { href: this.href },
          bubbles: true,
          composed: true,
        })
      );

      // Also update browser history directly
      window.history.pushState({}, "", this.href);

      // Dispatch popstate to trigger router update
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  render() {
    return html`
      <a href=${this.href} @click=${this._handleClick}>
        <slot></slot>
      </a>
    `;
  }
}

customElements.define("fable-link", FableLink);

// Stories
const meta = {
  component: "fable-link",
  args: { href: "?story=fable-button/primary" },
  slots: {
    default: "Click me",
  },
};

const stories = {
  Default: (args, slots) =>
    html`<fable-link href=${args.href} ?active=${args.active}
      >${slots?.default ?? "Click me"}</fable-link
    >`,
  Active: {
    args: (args) => ({ ...args, active: true }),
    lockedArgs: { active: true },
    render: (args, slots) =>
      html`<fable-link href=${args.href} ?active=${args.active}
        >${slots?.default ?? "Active Link"}</fable-link
      >`,
  },
};

window[STORIES_KEY] = window[STORIES_KEY] || [];
window[STORIES_KEY].push({ meta, stories });
