import { PROJECT_NAME } from "@config";
import {
  getCurrentArgs,
  getCurrentRecipeBlueprint,
  getCurrentSlots,
  getProcessedSlots,
  getSelectedRecipe,
  getSelectedStory,
  getStories,
  getView,
  toggleSourceDrawer,
} from "@store";
import { getStatusTooltip, parseMarkdown } from "@utils";
import { html, LitElement } from "lit";
import "@design-system/preview.js";
import "@design-system/header.js";
import "@design-system/badge.js";
import "@design-system/icon-button.js";
import "@design-system/docs-page.js";
import "@design-system/stack.js";
import "./fable-recipes-view.js";
import { AUTO_RECIPES_STORY_TYPE } from "../config/recipes.js";

/**
 * Story Preview - Center preview area with header
 */
export class FableStoryPreview extends LitElement {
  static properties = {
    _stories: { state: true },
    _selected: { state: true },
    _args: { state: true },
    _slots: { state: true },
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
    if (["stories", "selectedStory", "currentArgs", "currentSlots"].includes(key)) {
      this._stories = getStories();
      this._selected = getSelectedStory();
      this._args = getCurrentArgs();
      this._slots = getCurrentSlots();
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

  _handleSourceClick() {
    toggleSourceDrawer();
  }
  _isAutoRecipesStory(story) {
    return story?.type === AUTO_RECIPES_STORY_TYPE;
  }

  _isRenderableStoryEntry(story) {
    if (!story) return false;
    if (this._isAutoRecipesStory(story)) return false;
    if (story?.type === "docs") return false;
    if (typeof story === "function") return true;
    if (typeof story?.render === "function") return true;
    return false;
  }

  _getBaseStoryRenderer(group) {
    if (!group?.stories) return null;
    for (const entry of Object.values(group.stories)) {
      if (!this._isRenderableStoryEntry(entry)) continue;
      if (typeof entry === "function") {
        return entry;
      }
      if (typeof entry?.render === "function") {
        return entry.render.bind(entry);
      }
    }
    return null;
  }

  render() {
    if (!this._selected || this._view?.name !== "component") {
      return html`<fable-preview>
        <h1>Welcome to ${PROJECT_NAME}</h1>
        <p>
          No stories found — add components with stories in the components/
          folder.
        </p>
      </fable-preview>`;
    }

    const group = this._stories[this._selected.groupIndex];
    const story = group.stories[this._selected.name];
    const status = group.meta?.status;
    const isDocsStory = group.meta?.type === "docs" || story?.type === "docs";
    const isRecipesStory = this._isAutoRecipesStory(story);

    if (isDocsStory) {
      const docTitle = story?.title || group.meta?.title || this._selected.name;
      const docDescription = story?.description || group.meta?.description || "";
      const parsed = parseMarkdown(story?.content || group.meta?.content || "");

      return html`
        <div class="preview-card">
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

    if (isRecipesStory) {
      return html`
        <div class="preview-card">
          <fable-recipes-view
            .blueprint=${this._recipeBlueprint}
            .selection=${this._recipeSelection}
            .renderStory=${this._getBaseStoryRenderer(group)}
            .baseSlots=${group.meta?.slots || {}}
          ></fable-recipes-view>
        </div>
      `;
    }

    // Support both function and object format
    const storyFn = typeof story === "function" ? story : story.render;
    const processedSlots = getProcessedSlots();

    return html`
      <div class="preview-card">
        <fable-header>
          <h3>${group.meta.title} — ${this._selected.name}</h3>
          <div class="preview-meta">
            ${
              status
                ? html`<fable-badge
                  variant=${status}
                  tooltip=${getStatusTooltip(status)}
                  >${status}</fable-badge
                >`
                : ""
            }
            <fable-icon-button
              aria-label="View source code"
              @click=${this._handleSourceClick}
            >
              🧑‍💻
            </fable-icon-button>
          </div>
        </fable-header>
        <fable-preview>
          <div class="story-area">${storyFn(this._args, processedSlots)}</div>
        </fable-preview>
      </div>
    `;
  }
}

customElements.define("fable-story-preview", FableStoryPreview);
