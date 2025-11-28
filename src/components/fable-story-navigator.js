import {
  getDocsMetadata,
  getIconMetadata,
  getSelectedStory,
  getStories,
  getTokenMetadata,
} from "@store";
import {
  buildDocsPath,
  buildIconsPath,
  buildStoryURL,
  buildTokensPath,
  getStatusTooltip,
} from "@utils";
import { html, LitElement } from "lit";
import "@design-system/sidebar.js";
import "@design-system/nav-group.js";
import "@design-system/badge.js";
import "@design-system/link.js";
import { navigateTo } from "../router.js";

/**
 * Story Navigator - Left sidebar with navigation
 */
export class FableStoryNavigator extends LitElement {
  static properties = {
    _stories: { state: true },
    _selected: { state: true },
    _docs: { state: true },
    _tokens: { state: true },
    _icons: { state: true },
    _query: { state: true },
  };

  constructor() {
    super();
    this._stories = getStories();
    this._selected = getSelectedStory();
    this._docs = getDocsMetadata();
    this._tokens = getTokenMetadata();
    this._icons = getIconMetadata();
    this._query = "";
    this._handleStateChange = this._handleStateChange.bind(this);
    this.style.display = "contents";
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
    if (key === "stories" || key === "selectedStory") {
      this._stories = getStories();
      this._selected = getSelectedStory();
    }
    if (key === "metadata") {
      this._docs = getDocsMetadata();
      this._tokens = getTokenMetadata();
      this._icons = getIconMetadata();
    }
    this.requestUpdate();
  }

  _isActiveStory(groupIndex, storyName) {
    return (
      this._selected &&
      this._selected.groupIndex === groupIndex &&
      this._selected.name === storyName
    );
  }

  _getStoryHref(groupIndex, storyName) {
    const group = this._stories[groupIndex];
    if (!group) return "#";
    return buildStoryURL(this._stories, groupIndex, storyName, group.meta?.args || {});
  }

  _handleStoryClick(e, groupIndex, name) {
    e.preventDefault();
    navigateTo(this._getStoryHref(groupIndex, name));
  }

  _handleDocsClick(e, doc) {
    e.preventDefault();
    navigateTo(buildDocsPath(doc.section, doc.slug));
  }

  _handleTokenClick(e, token) {
    e.preventDefault();
    navigateTo(buildTokensPath(token.id));
  }

  _handleIconClick(e, icon) {
    e.preventDefault();
    navigateTo(buildIconsPath(icon.id));
  }

  _handleSearchInput(event) {
    this._query = event.target.value;
  }

  _handleHomeClick(e) {
    e.preventDefault();
    navigateTo("/");
  }

  _matchesQuery(text, query) {
    return text?.toLowerCase().includes(query);
  }

  _filterStories() {
    const query = this._query.trim().toLowerCase();
    if (!query) {
      return this._stories.map((group, groupIndex) => ({
        group,
        groupIndex,
        stories: Object.keys(group.stories),
      }));
    }

    const filtered = [];
    this._stories.forEach((group, groupIndex) => {
      const storyNames = Object.keys(group.stories);
      const groupMatches =
        this._matchesQuery(group.meta?.title, query) ||
        group.meta?.taxonomy?.tags?.some((tag) => this._matchesQuery(tag, query));
      const filteredStories = storyNames.filter((name) => this._matchesQuery(name, query));

      if (groupMatches || filteredStories.length) {
        filtered.push({
          group,
          groupIndex,
          stories: groupMatches ? storyNames : filteredStories,
        });
      }
    });

    return filtered;
  }

  _filterList(items = []) {
    const query = this._query.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      const fields = [item.title, item.description, item.section, ...(item.taxonomy?.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return fields.includes(query);
    });
  }

  _renderDocsSection() {
    const docs = this._filterList(this._docs);
    if (!docs?.length) return null;

    const sections = docs.reduce((acc, doc) => {
      const key = doc.section || "general";
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key).push(doc);
      return acc;
    }, new Map());

    return html`
      <section class="navigator-section">
        <h2 class="navigator-heading">Docs</h2>
        ${[...sections.entries()].map(
          ([section, docs]) => html`
            <fable-nav-group title=${section}>
              ${docs.map(
                (doc) => html`
                  <fable-link
                    href=${buildDocsPath(doc.section, doc.slug)}
                    data-doc=${doc.id}
                    @click=${(e) => this._handleDocsClick(e, doc)}
                  >
                    ${doc.title}
                  </fable-link>
                `
              )}
            </fable-nav-group>
          `
        )}
      </section>
    `;
  }

  _renderTokensSection() {
    const tokens = this._filterList(this._tokens);
    if (!tokens?.length) return null;
    const groups = tokens.reduce((acc, token) => {
      const key = token.taxonomy?.group || "Tokens";
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key).push(token);
      return acc;
    }, new Map());

    return html`
      <section class="navigator-section">
        <h2 class="navigator-heading">Tokens</h2>
        ${[...groups.entries()].map(
          ([group, tokens]) => html`
            <fable-nav-group title=${group}>
              ${tokens.map(
                (token) => html`
                  <fable-link
                    href=${buildTokensPath(token.id)}
                    @click=${(e) => this._handleTokenClick(e, token)}
                  >
                    ${token.title}
                  </fable-link>
                `
              )}
            </fable-nav-group>
          `
        )}
      </section>
    `;
  }

  _renderIconsSection() {
    const icons = this._filterList(this._icons);
    if (!icons?.length) return null;
    return html`
      <section class="navigator-section">
        <h2 class="navigator-heading">Icons</h2>
        <fable-nav-group title="Gallery">
          ${icons.map(
            (icon) => html`
              <fable-link
                href=${buildIconsPath(icon.id)}
                @click=${(e) => this._handleIconClick(e, icon)}
                >${icon.title}</fable-link
              >
            `
          )}
        </fable-nav-group>
      </section>
    `;
  }

  render() {
    const filteredStories = this._filterStories();
    return html`
      <fable-sidebar>
        <div class="navigator-search">
          <input
            type="search"
            placeholder="Search components, docs, tokens"
            .value=${this._query}
            @input=${this._handleSearchInput}
          />
        </div>
        <section class="navigator-section">
          <h2 class="navigator-heading">Overview</h2>
          <fable-link href="/" @click=${this._handleHomeClick}
            >Homepage</fable-link
          >
        </section>
        <section class="navigator-section">
          <h2 class="navigator-heading">Components</h2>
          ${
            filteredStories.length === 0
              ? html`<p>No components match "${this._query}".</p>`
              : filteredStories.map(
                  ({ group, groupIndex, stories }) => html`
                  <fable-nav-group title=${group.meta.title}>
                    ${
                      group.meta?.taxonomy?.status
                        ? html`<fable-badge
                          slot="title"
                          variant=${group.meta.taxonomy.status}
                          size="condensed"
                          tooltip=${getStatusTooltip(group.meta.taxonomy.status)}
                          >${group.meta.taxonomy.status}</fable-badge
                        >`
                        : ""
                    }
                    ${stories.map(
                      (name) => html`
                        <fable-link
                          href=${this._getStoryHref(groupIndex, name)}
                          ?active=${this._isActiveStory(groupIndex, name)}
                          @click=${(e) => this._handleStoryClick(e, groupIndex, name)}
                        >
                          ${name}
                        </fable-link>
                      `
                    )}
                  </fable-nav-group>
                `
                )
          }
        </section>

        ${this._renderDocsSection()} ${this._renderTokensSection()}
        ${this._renderIconsSection()}
      </fable-sidebar>
    `;
  }
}

customElements.define("fable-story-navigator", FableStoryNavigator);
