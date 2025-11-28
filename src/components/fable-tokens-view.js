import { css, html, LitElement } from "lit";
import { getTokenMetadata, getView } from "@store";
import { navigateTo } from "../router.js";
import { buildTokensPath } from "@utils";

export class FableTokensView extends LitElement {
  static properties = {
    _tokens: { state: true },
    _view: { state: true },
    _activeTokenId: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--bg-primary);
      color: var(--text-primary);
    }
    .tokens-layout {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
      gap: var(--space-6, 32px);
      height: 100%;
      padding: var(--space-5, 24px);
    }
    .token-list {
      overflow-y: auto;
      padding-right: var(--space-3, 12px);
    }
    .token-detail {
      border: 1px solid var(--border-color);
      border-radius: var(--radius, 12px);
      padding: var(--space-4);
      background: var(--bg-secondary);
      position: sticky;
      top: 24px;
      align-self: start;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .token-card.active {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px
        color-mix(in srgb, var(--primary-color) 40%, transparent);
    }
    .token-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-4, 16px);
    }
    .token-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius, 12px);
      padding: var(--space-4, 16px);
      background: var(--bg-secondary);
      cursor: pointer;
    }
    .swatch {
      width: 100%;
      height: 64px;
      border-radius: var(--radius, 12px);
      margin-bottom: var(--space-3, 12px);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    .meta {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    h2 {
      margin-top: 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    .detail-row code {
      background: rgba(0, 0, 0, 0.08);
      padding: 2px 6px;
      border-radius: 6px;
    }
    button {
      font-size: 0.85rem;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      background: transparent;
      color: inherit;
    }
  `;

  constructor() {
    super();
    this._tokens = getTokenMetadata();
    this._view = getView();
    this._activeTokenId = null;
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
    return (
      this._tokens.find((token) => token.id === this._activeTokenId) ||
      this._tokens[0]
    );
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
        ${token.attributes?.cssVar
          ? html`<div class="detail-row">
              <span>CSS Var</span>
              <code>${token.attributes.cssVar}</code>
            </div>`
          : null}
        <p>${token.description || "No description"}</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button @click=${() => navigator.clipboard.writeText(token.value)}>
            Copy value
          </button>
          ${token.attributes?.cssVar
            ? html`<button
                @click=${() =>
                  navigator.clipboard.writeText(token.attributes.cssVar)}
              >
                Copy CSS var
              </button>`
            : null}
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
                        class="token-card ${token.id === this._activeTokenId
                          ? "active"
                          : ""}"
                        @click=${() => this._handleTokenSelect(token)}
                      >
                        ${this._renderSwatch(token)}
                        <h3>${token.title}</h3>
                        <div class="value">${token.value}</div>
                        <div class="meta">
                          ${token.description || token.tokenType}
                        </div>
                      </article>
                    `,
                  )}
                </div>
              </section>
            `,
          )}
        </div>
        ${this._renderTokenDetail(activeToken)}
      </div>
    `;
  }
}

customElements.define("fable-tokens-view", FableTokensView);
