import {
  getHomepageHeroContent,
  getHomepageHighlightCards,
  getHomepageRecentComponents,
  getHomepageSearchSpotlights,
  getHomepageTaxonomyGroups,
  getView,
} from "@store";
import { html, LitElement } from "lit";
import "./fable-home-hero.js";
import "./fable-home-cards.js";
import "./fable-home-activity.js";
import "./fable-chip-group.js";
import "./fable-search-spotlight.js";

export class FableHomeView extends LitElement {
  static properties = {
    _view: { state: true },
    _hero: { state: true },
    _cards: { state: true },
    _recent: { state: true },
    _chips: { state: true },
    _selectedChip: { state: true },
    _spotlights: { state: true },
  };

  constructor() {
    super();
    this._view = getView();
    this._selectedChip = "all";
    this._hydrateData();
    this._handleStateChange = this._handleStateChange.bind(this);
    this.style.display = "block";
    this.style.height = "100%";
    this.style.overflowY = "auto";
    this.style.background = "var(--bg-primary)";
    this.style.color = "var(--text-primary)";
    this.style.padding = "var(--space-6, 32px)";
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

  _hydrateData() {
    this._hero = getHomepageHeroContent();
    this._cards = getHomepageHighlightCards();
    this._recent = getHomepageRecentComponents(8);
    this._chips = getHomepageTaxonomyGroups();
    this._spotlights = getHomepageSearchSpotlights();
  }

  _handleStateChange(e) {
    const { key } = e.detail;
    if (key === "view") {
      this._view = getView();
    }
    if (key === "metadata" || key === "stories") {
      this._hydrateData();
    }
  }

  _handleChipSelect(event) {
    this._selectedChip = event.detail.value;
  }

  _filteredActivity() {
    if (this._selectedChip === "all") return this._recent;
    return this._recent.filter((item) => item.taxonomy?.group === this._selectedChip);
  }

  render() {
    if (this._view?.name !== "home") {
      return html`<div style="padding:32px;">Loading home...</div>`;
    }

    return html`
      <div class="home-grid">
        <fable-home-hero .data=${this._hero}></fable-home-hero>

        <section class="home-section">
          <header class="home-section-header">
            <h2 class="home-section-title">Highlights</h2>
          </header>
          <fable-home-cards .cards=${this._cards}></fable-home-cards>
        </section>

        <section class="home-section" @chip-select=${this._handleChipSelect}>
          <header class="home-section-header">
            <h2 class="home-section-title">Recent activity</h2>
          </header>
          <fable-chip-group
            .chips=${this._chips}
            .active=${this._selectedChip}
          ></fable-chip-group>
          <div class="home-two-column">
            <fable-home-activity
              .items=${this._filteredActivity()}
            ></fable-home-activity>
            <div class="home-spotlight-card">
              <h3 class="home-section-title">Search spotlight</h3>
              <fable-search-spotlight
                .items=${this._spotlights}
              ></fable-search-spotlight>
            </div>
          </div>
        </section>
      </div>
    `;
  }
}

customElements.define("fable-home-view", FableHomeView);
