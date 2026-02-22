import { getSelectedStory, getStories } from "../store/index.js";
import { buildStoryURL, getStatusTooltip } from "../utils/index.js";
import { html, LitElement } from "lit";
import "../../ui/sidebar.js";
import "../../ui/nav-group.js";
import "../../ui/badge.js";
import "../../ui/search-input.js";
import "../../ui/heading.js";
import "../../ui/stack.js";
import "./fable-theme-toggle.js";
import { navigateTo } from "../router.js";

export class FableStoryNavigator extends LitElement {
  static properties = {
    _stories: { state: true },
    _selected: { state: true },
    _query: { state: true },
  };

  constructor() {
    super();
    this._stories = getStories();
    this._selected = getSelectedStory();
    this._query = "";
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
    if (key === "stories" || key === "selectedStory") {
      this._stories = getStories();
      this._selected = getSelectedStory();
    }
    this.requestUpdate();
  }

  _isActiveGroup(groupIndex) {
    return this._selected?.groupIndex === groupIndex;
  }

  _getFirstStoryName(group) {
    return Object.keys(group.stories || {})[0] || "default";
  }

  _getGroupHref(groupIndex) {
    const group = this._stories[groupIndex];
    if (!group) return "#";
    const firstName = this._getFirstStoryName(group);
    return buildStoryURL(this._stories, groupIndex, firstName, group.meta?.args || {});
  }

  _handleGroupClick(event, groupIndex) {
    event.preventDefault();
    const href = this._getGroupHref(groupIndex);
    navigateTo(href);
  }

  _filterStories() {
    const query = this._query.trim().toLowerCase();
    return this._stories
      .map((group, groupIndex) => ({ group, groupIndex }))
      .filter(({ group }) =>
        query
          ? `${group.meta?.title || ""} ${group.meta?.taxonomy?.group || ""}`
              .toLowerCase()
              .includes(query)
          : true,
      );
  }

  _handleSearchInput(event) {
    this._query = event.target.value;
  }

  render() {
    const filtered = this._filterStories();
    return html`
      <fable-sidebar>
        <fable-stack direction="row" align-items="center" style="gap: var(--space-2)">
          <fable-search-input
            placeholder="Search components"
            .value=${this._query}
            @input=${this._handleSearchInput}
          ></fable-search-input>
          <fable-theme-toggle></fable-theme-toggle>
        </fable-stack>
        <section class="navigator-section">
          ${filtered.length === 0
            ? html`<p>No components match "${this._query}".</p>`
            : filtered.map(
                ({ group, groupIndex }) => html`
                  <fable-nav-group
                    title=${group.meta.title}
                    class=${this._isActiveGroup(groupIndex) ? "is-active" : ""}
                    @click=${(e) => this._handleGroupClick(e, groupIndex)}
                  >
                    ${group.meta?.taxonomy?.status
                      ? html`<fable-badge
                          slot="title"
                          variant=${group.meta.taxonomy.status}
                          size="condensed"
                          tooltip=${getStatusTooltip(group.meta.taxonomy.status)}
                        >${group.meta.taxonomy.status}</fable-badge>`
                      : ""}
                  </fable-nav-group>
                `,
              )}
        </section>
      </fable-sidebar>
    `;
  }
}

customElements.define("fable-story-navigator", FableStoryNavigator);
