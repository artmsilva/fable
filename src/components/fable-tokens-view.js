import { getTokenMetadata, getView } from "@store";
import { buildTokensPath } from "@utils";
import { html, LitElement } from "lit";
import { navigateTo } from "../router.js";

export class FableTokensView extends LitElement {
  static properties = {
    _tokens: { state: true },
    _view: { state: true },
    _activeTokenId: { state: true },
  };

  constructor() {
    super();
    this._tokens = getTokenMetadata();
    this._view = getView();
    this._activeTokenId = null;
    this._handleStateChange = this._handleStateChange.bind(this);
    this.style.display = "block";
    this.style.height = "100%";
    this.style.background = "var(--bg-primary)";
    this.style.color = "var(--text-primary)";
  }

  createRenderRoot() {
    return this;
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
    const { key } = e.detail;
    if (key === "view") {
      this._view = getView();
      this._activeTokenId = this._view?.params?.tokenId || null;
    }
    if (key === "metadata") {
      this._tokens = getTokenMetadata();
      if (!this._activeTokenId && this._tokens.length) {
        this._activeTokenId = this._tokens[0].id;
      }
    }
  }

  _groupedTokens() {
    const groups = new Map();
    this._tokens.forEach((token) => {
      const key = token.taxonomy?.group || "Tokens";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(token);
    });
    return [...groups.entries()];
  }

  _renderSwatch(token) {
    if (token.tokenType !== "color") return null;
    return html`<div class="swatch" style="background: ${token.value};"></div>`;
  }

  _getActiveToken() {
    if (!this._tokens.length) return null;
    return this._tokens.find((token) => token.id === this._activeTokenId) || this._tokens[0];
  }

  _handleTokenSelect(token) {
    this._activeTokenId = token.id;
    navigateTo(buildTokensPath(token.id));
  }

  _renderTokenDetail(token) {
    if (!token) {
      return html`<div class="token-detail">Select a token to inspect.</div>`;
    }
    return html`
      <aside class="token-detail">
        <h3>${token.title}</h3>
        <div class="detail-row">
          <span>Value</span>
          <code>${token.value}</code>
        </div>
        <div class="detail-row">
          <span>Type</span>
          <code>${token.tokenType}</code>
        </div>
        ${
          token.attributes?.cssVar
            ? html`<div class="detail-row">
              <span>CSS Var</span>
              <code>${token.attributes.cssVar}</code>
            </div>`
            : null
        }
        <p>${token.description || "No description"}</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button @click=${() => navigator.clipboard.writeText(token.value)}>
            Copy value
          </button>
          ${
            token.attributes?.cssVar
              ? html`<button
                @click=${() => navigator.clipboard.writeText(token.attributes.cssVar)}
              >
                Copy CSS var
              </button>`
              : null
          }
        </div>
      </aside>
    `;
  }

  render() {
    if (this._view?.name !== "tokens") {
      return html`<div>Select a token category to explore.</div>`;
    }

    const groups = this._groupedTokens();
    const activeToken = this._getActiveToken();
    return html`
      <div class="tokens-layout">
        <div class="token-list">
          ${groups.map(
            ([group, tokens]) => html`
              <section>
                <h2>${group}</h2>
                <div class="token-grid">
                  ${tokens.map(
                    (token) => html`
                      <article
                        class="token-card ${token.id === this._activeTokenId ? "active" : ""}"
                        @click=${() => this._handleTokenSelect(token)}
                      >
                        ${this._renderSwatch(token)}
                        <h3>${token.title}</h3>
                        <div class="value">${token.value}</div>
                        <div class="meta">
                          ${token.description || token.tokenType}
                        </div>
                      </article>
                    `
                  )}
                </div>
              </section>
            `
          )}
        </div>
        ${this._renderTokenDetail(activeToken)}
      </div>
    `;
  }
}

customElements.define("fable-tokens-view", FableTokensView);
