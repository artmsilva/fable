import { getIconMetadata, getView } from "@store";
import { buildIconsPath } from "@utils";
import { html, LitElement } from "lit";
import { navigateTo } from "../router.js";

export class FableIconsView extends LitElement {
  static properties = {
    _icons: { state: true },
    _view: { state: true },
    _activeIconId: { state: true },
  };

  constructor() {
    super();
    this._icons = getIconMetadata();
    this._view = getView();
    this._activeIconId = null;
    this._handleStateChange = this._handleStateChange.bind(this);
    this.style.display = "block";
    this.style.height = "100%";
    this.style.background = "var(--bg-primary)";
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
    return this._icons.find((icon) => icon.id === this._activeIconId) || this._icons[0];
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
                  class="icon-card ${icon.id === this._activeIconId ? "active" : ""}"
                  @click=${() => this._handleIconSelect(icon)}
                >
                  ${this._renderIcon(icon)}
                  <strong>${icon.title}</strong>
                </article>
              `
            )}
          </div>
        </div>
        ${this._renderDetail(activeIcon)}
      </div>
    `;
  }
}

customElements.define("fable-icons-view", FableIconsView);
