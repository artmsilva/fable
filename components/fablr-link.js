import { css, html, LitElement } from "lit";

class FablrLink extends LitElement {
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
      color: color-mix(in srgb, var(--primary-color) 90%, black);
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

customElements.define("fablr-link", FablrLink);

// Stories
const meta = {
  title: "Fablr Link",
  component: "fablr-link",
  args: {
    href: "?story=fablr-button/primary",
    active: false,
  },
  slots: {
    default: "Click me",
  },
};

const stories = {
  Default: (args, slots) =>
    html`<fablr-link href=${args.href} ?active=${args.active}
      >${slots?.default ?? "Click me"}</fablr-link
    >`,
  Active: {
    args: (args) => ({ ...args, active: true }),
    lockedArgs: { active: true },
    render: (args, slots) =>
      html`<fablr-link href=${args.href} ?active=${args.active}
        >${slots?.default ?? "Active Link"}</fablr-link
      >`,
  },
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
