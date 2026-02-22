import { PROJECT_NAME } from "@config";
import {
  getCurrentArgs,
  getCurrentRecipeBlueprint,
  getCurrentSlots,
  getLockedArgs,
  getProcessedSlots,
  getSelectedRecipe,
  getSelectedStory,
  getStories,
  getView,
  unlockArg,
  updateArg,
} from "@store";
import { getStatusTooltip, getStorySource, parseMarkdown } from "@utils";
import { html, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import "@design-system/preview.js";
import "@design-system/badge.js";
import "@design-system/code-block.js";
import "@design-system/heading.js";
import "@design-system/attributes-table.js";
import "@design-system/docs-page.js";
import "./fable-recipes-view.js";
import { AUTO_RECIPES_STORY_TYPE } from "../config/recipes.js";

/**
 * Unified Component Page — renders a single scrollable page showing
 * everything about a component: hero, live preview, attributes table,
 * code sample, story gallery, recipes, and docs.
 */
export class FableStoryPreview extends LitElement {
  static properties = {
    _stories: { state: true },
    _selected: { state: true },
    _args: { state: true },
    _slots: { state: true },
    _locked: { state: true },
    _view: { state: true },
    _recipeBlueprint: { state: true },
    _recipeSelection: { state: true },
  };

  constructor() {
    super();
    this._stories = getStories();
    this._selected = getSelectedStory();
    this._args = getCurrentArgs();
    this._slots = getCurrentSlots();
    this._locked = getLockedArgs();
    this._view = getView();
    this._recipeBlueprint = getCurrentRecipeBlueprint();
    this._recipeSelection = getSelectedRecipe();
    this._handleStateChange = this._handleStateChange.bind(this);
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
    const key = e.detail.key;
    if (
      ["stories", "selectedStory", "currentArgs", "currentSlots", "lockedArgs"].includes(key)
    ) {
      this._stories = getStories();
      this._selected = getSelectedStory();
      this._args = getCurrentArgs();
      this._slots = getCurrentSlots();
      this._locked = getLockedArgs();
      this._recipeBlueprint = getCurrentRecipeBlueprint();
      this._recipeSelection = getSelectedRecipe();
      this.requestUpdate();
    }
    if (key === "view") {
      this._view = getView();
    }
    if (key === "selectedRecipe") {
      this._recipeSelection = getSelectedRecipe();
      this.requestUpdate();
    }
  }

  _isAutoRecipesStory(story) {
    return story?.type === AUTO_RECIPES_STORY_TYPE;
  }

  _isRenderableStoryEntry(entry) {
    if (!entry) return false;
    if (this._isAutoRecipesStory(entry)) return false;
    if (entry?.type === "docs") return false;
    if (typeof entry === "function") return true;
    if (typeof entry?.render === "function") return true;
    return false;
  }

  _getBaseStoryRenderer(group) {
    if (!group?.stories) return null;
    for (const entry of Object.values(group.stories)) {
      if (!this._isRenderableStoryEntry(entry)) continue;
      if (typeof entry === "function") return entry;
      if (typeof entry?.render === "function") return entry.render.bind(entry);
    }
    return null;
  }

  _getFirstRenderableStoryName(group) {
    if (!group?.stories) return null;
    for (const [name, entry] of Object.entries(group.stories)) {
      if (this._isRenderableStoryEntry(entry)) return name;
    }
    return null;
  }

  _handleArgChange(e) {
    updateArg(e.detail.key, e.detail.value);
  }

  _handleArgUnlock(e) {
    unlockArg(e.detail.key);
  }

  // ── Section renderers ──────────────────────────────────────────────

  _renderHero(group) {
    const status = group.meta?.status || group.meta?.taxonomy?.status;
    const description = group.meta?.description;
    return html`
      <section class="component-section component-hero">
        <div class="component-hero__title-row">
          <fable-heading level="1">${group.meta.title}</fable-heading>
          ${status
            ? html`<fable-badge
                variant=${status}
                tooltip=${getStatusTooltip(status)}
              >${status}</fable-badge>`
            : ""}
        </div>
        ${description ? html`<p class="component-hero__description">${description}</p>` : ""}
      </section>
    `;
  }

  _renderLivePreview(storyFn, processedSlots) {
    return html`
      <section class="component-section">
        <div class="section-label">Preview</div>
        <fable-preview>
          <div class="story-area">${storyFn(this._args, processedSlots)}</div>
        </fable-preview>
      </section>
    `;
  }

  _renderAttributesTable(group) {
    const argDefs = group.meta?.args || {};
    if (!Object.keys(argDefs).length) return "";
    return html`
      <section class="component-section">
        <div class="section-label">Attributes</div>
        <fable-attributes-table
          .component=${group.meta?.component || ""}
          .args=${this._args}
          .lockedArgs=${this._locked}
          .argTypes=${group.meta?.argTypes || {}}
          .argDefs=${argDefs}
          @arg-change=${this._handleArgChange}
          @arg-unlock=${this._handleArgUnlock}
        ></fable-attributes-table>
      </section>
    `;
  }

  _renderCodeSample(group, storyName) {
    const source = getStorySource(group, storyName);
    if (!source) return "";
    return html`
      <section class="component-section">
        <div class="section-label">Code</div>
        <fable-code-block language="javascript" .code=${source}></fable-code-block>
      </section>
    `;
  }

  _renderStoryGallery(group, firstStoryName) {
    const entries = Object.entries(group.stories || {}).filter(
      ([name, entry]) => name !== firstStoryName && this._isRenderableStoryEntry(entry),
    );
    if (!entries.length) return "";

    const processedSlots = getProcessedSlots();
    return html`
      <section class="component-section">
        <div class="section-label">Stories</div>
        <div class="story-gallery">
          ${entries.map(([name, entry]) => {
            const storyFn = typeof entry === "function" ? entry : entry.render;
            const storyArgs =
              typeof entry === "object" && entry.args
                ? entry.args({ ...(group.meta?.args || {}) })
                : { ...(group.meta?.args || {}) };
            return html`
              <div class="story-gallery__item">
                <fable-heading level="4">${name}</fable-heading>
                <fable-preview>
                  <div class="story-area">${storyFn(storyArgs, processedSlots)}</div>
                </fable-preview>
              </div>
            `;
          })}
        </div>
      </section>
    `;
  }

  _renderRecipes(group) {
    if (!this._recipeBlueprint?.axes?.length) return "";
    return html`
      <section class="component-section">
        <div class="section-label">Recipes</div>
        <fable-recipes-view
          .blueprint=${this._recipeBlueprint}
          .selection=${this._recipeSelection}
          .renderStory=${this._getBaseStoryRenderer(group)}
          .baseSlots=${group.meta?.slots || {}}
        ></fable-recipes-view>
      </section>
    `;
  }

  _renderDocs(group) {
    const docsEntry = Object.entries(group.stories || {}).find(
      ([, entry]) => entry?.type === "docs",
    );
    if (!docsEntry) return "";
    const [, story] = docsEntry;
    const parsed = parseMarkdown(story.content || "");
    if (!parsed.html) return "";
    return html`
      <section class="component-section">
        <div class="section-label">Documentation</div>
        <div class="component-docs">${unsafeHTML(parsed.html)}</div>
      </section>
    `;
  }

  // ── Page styles (injected into light DOM) ────────────────────────

  _renderPageStyles() {
    return html`<style>
      .component-page {
        display: flex;
        flex-direction: column;
        width: 100%;
        box-sizing: border-box;
        padding: var(--space-6, 24px) clamp(var(--space-6, 24px), 4vw, 48px);
        gap: 0;
        max-width: 1000px;
      }
      .component-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-3, 12px);
        padding-top: var(--space-6, 24px);
      }
      .component-section + .component-section {
        border-top: 1px solid var(--border-color);
        margin-top: var(--space-6, 24px);
      }
      .component-hero {
        padding-top: 0;
        padding-bottom: var(--space-2, 8px);
      }
      .component-hero + .component-section {
        border-top: none;
        margin-top: 0;
      }
      .component-hero__title-row {
        display: flex;
        align-items: center;
        gap: var(--space-3, 12px);
      }
      .component-hero__description {
        margin: 0;
        color: var(--text-secondary);
        max-width: 70ch;
        line-height: 1.6;
      }
      .section-label {
        font-size: var(--font-size-xs, 0.75rem);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-secondary);
      }
      fable-preview { min-height: 100px; }
      .story-area { width: 100%; }
      .story-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: var(--space-5, 20px);
      }
      .story-gallery__item {
        display: flex;
        flex-direction: column;
        gap: var(--space-2, 8px);
      }
      .story-gallery__item fable-preview { min-height: 140px; }
      .component-docs { line-height: 1.7; }
      .component-docs h1,
      .component-docs h2,
      .component-docs h3 {
        color: var(--text-primary);
        margin-top: var(--space-5, 20px);
        margin-bottom: var(--space-2, 8px);
      }
      .component-docs p { margin: 0 0 var(--space-3, 16px); }
      .component-docs ul {
        padding-left: var(--space-5, 24px);
        margin: 0 0 var(--space-3, 16px);
      }
    </style>`;
  }

  // ── Main render ────────────────────────────────────────────────────

  render() {
    if (!this._selected || this._view?.name !== "component") {
      return html`<fable-preview>
        <h1>Welcome to ${PROJECT_NAME}</h1>
        <p>No stories found — add components with stories in the components/ folder.</p>
      </fable-preview>`;
    }

    const group = this._stories[this._selected.groupIndex];
    const story = group.stories[this._selected.name];
    const isDocsStory = group.meta?.type === "docs" || story?.type === "docs";

    // Full docs page (standalone doc entry)
    if (isDocsStory) {
      const docTitle = story?.title || group.meta?.title || this._selected.name;
      const docDescription = story?.description || group.meta?.description || "";
      const parsed = parseMarkdown(story?.content || group.meta?.content || "");
      return html`
        ${this._renderPageStyles()}
        <div class="component-page">
          <fable-docs-page
            .section=${group.meta?.taxonomy?.group || "Components"}
            .title=${docTitle}
            .description=${docDescription}
            .content=${parsed.html || ""}
            .toc=${parsed.toc || []}
          ></fable-docs-page>
        </div>
      `;
    }

    // Unified component page
    const firstStoryName =
      this._getFirstRenderableStoryName(group) || this._selected.name;
    const renderer = this._getBaseStoryRenderer(group);
    const processedSlots = getProcessedSlots();

    return html`
      ${this._renderPageStyles()}
      <div class="component-page">
        ${this._renderHero(group)}
        ${renderer ? this._renderLivePreview(renderer, processedSlots) : ""}
        ${this._renderAttributesTable(group)}
        ${this._renderCodeSample(group, firstStoryName)}
        ${this._renderStoryGallery(group, firstStoryName)}
        ${this._renderRecipes(group)}
        ${this._renderDocs(group)}
      </div>
    `;
  }
}

customElements.define("fable-story-preview", FableStoryPreview);
