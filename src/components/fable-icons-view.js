import { css, html, LitElement } from "lit";
import { getIconMetadata, getView } from "@store";
import { navigateTo } from "../router.js";
import { buildIconsPath } from "@utils";

export class FableIconsView extends LitElement {
  static properties = {
    _icons: { state: true },
    _view: { state: true },
    _activeIconId: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--bg-primary);
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
      gap: var(--space-6, 32px);
      padding: var(--space-5, 24px);
      height: 100%;
    }
    .grid-container {
      overflow-y: auto;
      padding-right: var(--space-3);
    }
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: var(--space-3, 12px);
    }
    .icon-card.active {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px
        color-mix(in srgb, var(--primary-color) 40%, transparent);
    }
    .icon-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius, 12px);
      padding: var(--space-3, 12px);
      background: var(--bg-secondary);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2, 8px);
      text-align: center;
      cursor: pointer;
    }
    svg {
      width: 32px;
      height: 32px;
      fill: currentColor;
    }
    .detail-panel {
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
    button {
      font-size: 0.8rem;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: transparent;
      cursor: pointer;
    }
  `;

  constructor() {
    super();
    this._icons = getIconMetadata();
    this._view = getView();
    this._activeIconId = null;
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
      this._activeIconId = this._view?.params?.iconId || null;
    }
    if (key === "metadata") {
      this._icons = getIconMetadata();
      if (!this._activeIconId && this._icons.length) {
        this._activeIconId = this._icons[0].id;
      }
    }
  }

  _renderIcon(icon) {
    return html`<svg viewBox="0 0 24 24">
      <path d=${icon.svgPath}></path>
    </svg>`;
  }

  _getActiveIcon() {
    if (!this._icons.length) return null;
    return (
      this._icons.find((icon) => icon.id === this._activeIconId) ||
      this._icons[0]
    );
  }

  _handleIconSelect(icon) {
    this._activeIconId = icon.id;
    navigateTo(buildIconsPath(icon.id));
  }

  _renderDetail(icon) {
    if (!icon) {
      return html`<div class="detail-panel">
        Select an icon to view details.
      </div>`;
    }
    const svgMarkup = `<svg viewBox="0 0 24 24"><path d="${icon.svgPath}"></path></svg>`;
    return html`
      <aside class="detail-panel">
        <h3>${icon.title}</h3>
        <div style="font-size:2rem;">${this._renderIcon(icon)}</div>
        <div><strong>Style:</strong> ${icon.style}</div>
        ${icon.description ? html`<p>${icon.description}</p>` : null}
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button @click=${() => navigator.clipboard.writeText(icon.svgPath)}>
            Copy path
          </button>
          <button @click=${() => navigator.clipboard.writeText(svgMarkup)}>
            Copy SVG
          </button>
        </div>
      </aside>
    `;
  }

  render() {
    if (this._view?.name !== "icons") {
      return html`<div class="container">Select an icon to preview.</div>`;
    }

    const activeIcon = this._getActiveIcon();
    return html`
      <div class="layout">
        <div class="grid-container">
          <h2>Icon Library</h2>
          <div class="icon-grid">
            ${this._icons.map(
              (icon) => html`
                <article
                  class="icon-card ${icon.id === this._activeIconId
                    ? "active"
                    : ""}"
                  @click=${() => this._handleIconSelect(icon)}
                >
                  ${this._renderIcon(icon)}
                  <strong>${icon.title}</strong>
                </article>
              `,
            )}
          </div>
        </div>
        ${this._renderDetail(activeIcon)}
      </div>
    `;
  }
}

customElements.define("fable-icons-view", FableIconsView);
