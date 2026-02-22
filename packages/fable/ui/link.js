import { css, html, LitElement } from "lit";
import { define } from "../src/define.js";

class FableLink extends LitElement {
  static status = "stable";
  static title = "Navigation Link";
  static description = "Internal navigation link with active states.";
  static taxonomy = { group: "Navigation", tags: ["link", "navigation"] };

  static properties = { href: { type: String }, active: { type: Boolean, reflect: true } };
  static args = { href: "?story=fable-button/primary" };
  static slots = { default: "Click me" };

  static styles = css`
    :host { display: contents; }
    a { color: var(--primary-color); text-decoration: none; cursor: pointer; padding: calc(var(--space-base)) var(--space-2); border-radius: var(--space-base); transition: background-color 0.2s; display: inline-block; font-size: var(--font-body); font-family: var(--font-stack); }
    a:hover { background-color: color-mix(in srgb, var(--primary-color) 10%, transparent); text-decoration: underline; }
    :host([active]) a { background-color: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); font-weight: 600; }
  `;

  static stories = {
    Default: (args, slots) => html`<fable-link href=${args.href} ?active=${args.active}>${slots?.default ?? "Click me"}</fable-link>`,
    Active: {
      args: (args) => ({ ...args, active: true }),
      lockedArgs: { active: true },
      render: (args, slots) => html`<fable-link href=${args.href} ?active=${args.active}>${slots?.default ?? "Active Link"}</fable-link>`,
    },
  };

  constructor() { super(); this.href = ""; this.active = false; }
  _handleClick(e) { e.preventDefault(); if (this.href) { this.dispatchEvent(new CustomEvent("navigate", { detail: { href: this.href }, bubbles: true, composed: true })); window.history.pushState({}, "", this.href); window.dispatchEvent(new PopStateEvent("popstate")); } }
  render() { return html`<a href=${this.href} @click=${this._handleClick}><slot></slot></a>`; }
}

define("fable-link", FableLink);
