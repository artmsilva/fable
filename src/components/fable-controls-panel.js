import {
  getCurrentArgs,
  getCurrentSlots,
  getDocsMetadata,
  getIconMetadata,
  getLockedArgs,
  getSelectedStory,
  getStories,
  getTokenMetadata,
  getView,
  unlockArg,
  updateArg,
  updateSlot,
} from "@store";
import { parseMarkdown } from "@utils";
import { html, LitElement } from "lit";
import "@design-system/sidebar.js";
import "@design-system/stack.js";
import "@design-system/input.js";
import "@design-system/checkbox.js";
import "@design-system/select.js";
import "@design-system/textarea.js";
import "@design-system/button.js";
import "@design-system/token-detail.js";
import "@design-system/doc-toc.js";
import "@design-system/icon-detail.js";

/**
 * Controls Panel - Right sidebar with story controls
 */
export class FableControlsPanel extends LitElement {
  static properties = {
    _stories: { state: true },
    _selected: { state: true },
    _args: { state: true },
    _slots: { state: true },
    _locked: { state: true },
    _view: { state: true },
    _docs: { state: true },
    _tokens: { state: true },
    _icons: { state: true },
  };

  constructor() {
    super();
    this._stories = getStories();
    this._selected = getSelectedStory();
    this._args = getCurrentArgs();
    this._slots = getCurrentSlots();
    this._locked = getLockedArgs();
    this._view = getView();
    this._docs = getDocsMetadata();
    this._tokens = getTokenMetadata();
    this._icons = getIconMetadata();
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
    const key = e.detail.key;
    if (
      [
        "stories",
        "selectedStory",
        "currentArgs",
        "currentSlots",
        "lockedArgs",
      ].includes(key)
    ) {
      this._stories = getStories();
      this._selected = getSelectedStory();
      this._args = getCurrentArgs();
      this._slots = getCurrentSlots();
      this._locked = getLockedArgs();
      this.requestUpdate();
    }
    if (key === "view") {
      this._view = getView();
    }
    if (key === "metadata") {
      this._docs = getDocsMetadata();
      this._tokens = getTokenMetadata();
      this._icons = getIconMetadata();
    }
  }

  _handleArgChange(key, value) {
    updateArg(key, value);
  }

  _handleSlotChange(key, value) {
    updateSlot(key, value);
  }

  _handleUnlock(key) {
    unlockArg(key);
  }

  _activeDoc() {
    if (this._view?.name !== "docs") return null;
    const { section, slug, id } = this._view.params || {};
    return this._docs.find((doc) => {
      if (id && doc.id === id) return true;
      return doc.section === section && doc.slug === slug;
    });
  }

  _activeToken() {
    if (this._view?.name !== "tokens") return null;
    if (!this._tokens?.length) return null;
    const targetId = this._view.params?.tokenId;
    return (
      this._tokens.find((token) => token.id === targetId) || this._tokens[0]
    );
  }

  _activeIcon() {
    if (this._view?.name !== "icons") return null;
    if (!this._icons?.length) return null;
    const targetId = this._view.params?.iconId;
    return this._icons.find((icon) => icon.id === targetId) || this._icons[0];
  }

  _getSelectedStory() {
    if (!this._selected) return null;
    const group = this._stories[this._selected.groupIndex];
    if (!group) return null;
    const story = group.stories?.[this._selected.name];
    return { group, story };
  }

  _getDocsStory() {
    const selected = this._getSelectedStory();
    if (!selected) return null;
    const { group, story } = selected;
    const isDocs = group?.meta?.type === "docs" || story?.type === "docs";
    if (!isDocs) return null;
    return {
      content: story?.content || group.meta?.content || "",
    };
  }

  _renderControl(key, group) {
    const val = this._args[key];
    const isLocked = this._locked[key] === true;
    const argDefs = group.meta?.args || {};
    const argType = group.meta?.argTypes?.[key];

    // Get component class to check for enum definitions
    const componentName = group.meta?.component;
    const componentClass = componentName
      ? customElements.get(componentName)
      : null;

    // Check for enum in component's static properties
    const propEnum = componentClass?.properties?.[key]?.enum;
    const enumOptions = propEnum || argType?.options;

    // Select/dropdown control (from argTypes or property enum)
    if ((argType?.control === "select" || propEnum) && enumOptions) {
      return html`
        <fable-stack align-items="start">
          ${isLocked
            ? html`<fable-button
                variant="secondary"
                @click=${() => this._handleUnlock(key)}
              >
                🔓 Unlock ${key}
              </fable-button>`
            : ""}
          <fable-select
            label=${key}
            .value=${val}
            ?disabled=${isLocked}
            @change=${(e) => this._handleArgChange(key, e.detail)}
          >
            ${enumOptions.map(
              (opt) =>
                html`<fable-select-option value=${opt}
                  >${opt}</fable-select-option
                >`,
            )}
          </fable-select>
        </fable-stack>
      `;
    }

    // Boolean checkbox
    if (typeof argDefs[key] === "boolean" || typeof val === "boolean") {
      return html`
        <fable-stack align-items="start">
          ${isLocked
            ? html`<fable-button
                variant="secondary"
                @click=${() => this._handleUnlock(key)}
              >
                🔓 Unlock ${key}
              </fable-button>`
            : ""}
          <fable-checkbox
            label=${key}
            ?checked=${!!val}
            ?disabled=${isLocked}
            @change=${(e) => this._handleArgChange(key, e.detail)}
          ></fable-checkbox>
        </fable-stack>
      `;
    }

    // Text input (default)
    return html`
      <fable-stack align-items="start">
        ${isLocked
          ? html`<fable-button
              variant="secondary"
              @click=${() => this._handleUnlock(key)}
            >
              🔓 Unlock ${key}
            </fable-button>`
          : ""}
        <fable-input
          label=${key}
          .value=${val ?? ""}
          ?disabled=${isLocked}
          @input=${(e) => this._handleArgChange(key, e.detail)}
        ></fable-input>
      </fable-stack>
    `;
  }

  render() {
    if (this._view?.name === "docs") {
      const doc = this._activeDoc();
      const parsed = doc ? parseMarkdown(doc.content || "") : null;
      return html`
        <fable-sidebar position="right">
          ${parsed?.toc?.length
            ? html`<fable-doc-toc .toc=${parsed.toc}></fable-doc-toc>`
            : html`<p>No headings</p>`}
        </fable-sidebar>
      `;
    }

    if (this._view?.name === "tokens") {
      return html`
        <fable-sidebar position="right">
          <h3>Token detail</h3>
          <fable-token-detail
            .token=${this._activeToken()}
          ></fable-token-detail>
        </fable-sidebar>
      `;
    }

    if (this._view?.name === "icons") {
      return html`
        <fable-sidebar position="right">
          <h3>Icon detail</h3>
          <fable-icon-detail .icon=${this._activeIcon()}></fable-icon-detail>
        </fable-sidebar>
      `;
    }

    const docsStory = this._getDocsStory();
    if (docsStory) {
      const parsed = parseMarkdown(docsStory.content);
      return html`
        <fable-sidebar position="right">
          ${parsed?.toc?.length
            ? html`<fable-doc-toc .toc=${parsed.toc}></fable-doc-toc>`
            : html`<p>No headings</p>`}
        </fable-sidebar>
      `;
    }

    if (!this._selected) {
      return html`<fable-sidebar position="right">
        <p>Select a story to see controls</p>
      </fable-sidebar>`;
    }

    const group = this._stories[this._selected.groupIndex];
    const argDefs = group.meta?.args || {};
    const slotDefs = group.meta?.slots || {};
    const argKeys = Object.keys(argDefs);
    const slotKeys = Object.keys(slotDefs);

    if (!argKeys.length && !slotKeys.length) {
      return html`<fable-sidebar position="right">
        <p>No controls available</p>
      </fable-sidebar>`;
    }

    return html`
      <fable-sidebar position="right">
        <h3>Controls</h3>
        <fable-stack>
          ${argKeys.map((k) => this._renderControl(k, group))}
          ${slotKeys.map((k) => {
            const val = this._slots[k] ?? slotDefs[k];
            // Display template result as readable text
            const displayVal =
              typeof val === "string" ? val : "[HTML Template]";
            return html`
              <fable-textarea
                label=${k}
                .value=${displayVal}
                rows="3"
                ?disabled=${typeof val !== "string"}
                @input=${(e) => this._handleSlotChange(k, e.detail)}
              ></fable-textarea>
            `;
          })}
        </fable-stack>
      </fable-sidebar>
    `;
  }
}

customElements.define("fable-controls-panel", FableControlsPanel);
