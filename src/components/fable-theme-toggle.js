import { getTheme, toggleTheme } from "@store";
import { css, html, LitElement } from "lit";
import "@design-system/icon-button.js";

/**
 * Theme Toggle - Floating theme switcher button
 */
export class FableThemeToggle extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  static properties = {
    _theme: { state: true },
  };

  constructor() {
    super();
    this._theme = getTheme();
    this._handleStateChange = this._handleStateChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("state-changed", this._handleStateChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("state-changed", this._handleStateChange);
  }

  _handleStateChange(e) {
    if (e.detail.key === "theme") {
      this._theme = getTheme();
      this.requestUpdate();
    }
  }

  _handleToggle() {
    toggleTheme();
  }

  render() {
    const isDark = this._theme === "dark";
    return html`
      <fable-icon-button aria-label="Toggle theme" @click=${this._handleToggle}>
        ${isDark ? "☀️" : "🌙"}
      </fable-icon-button>
    `;
  }
}

customElements.define("fable-theme-toggle", FableThemeToggle);
