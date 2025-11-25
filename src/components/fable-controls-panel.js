import {
  getCurrentArgs,
  getCurrentSlots,
  getLockedArgs,
  getSelectedStory,
  getStories,
  unlockArg,
  updateArg,
  updateSlot,
} from "@store";
import { css, html, LitElement } from "lit";
import "@design-system/sidebar.js";
import "@design-system/stack.js";
import "@design-system/input.js";
import "@design-system/checkbox.js";
import "@design-system/select.js";
import "@design-system/textarea.js";
import "@design-system/button.js";

/**
 * Controls Panel - Right sidebar with story controls
 */
export class FableControlsPanel extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  static properties = {
    _stories: { state: true },
    _selected: { state: true },
    _args: { state: true },
    _slots: { state: true },
    _locked: { state: true },
  };

  constructor() {
    super();
    this._stories = getStories();
    this._selected = getSelectedStory();
    this._args = getCurrentArgs();
    this._slots = getCurrentSlots();
    this._locked = getLockedArgs();
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
    if (["stories", "selectedStory", "currentArgs", "currentSlots", "lockedArgs"].includes(key)) {
      this._stories = getStories();
      this._selected = getSelectedStory();
      this._args = getCurrentArgs();
      this._slots = getCurrentSlots();
      this._locked = getLockedArgs();
      this.requestUpdate();
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

  _renderControl(key, group) {
    const val = this._args[key];
    const isLocked = this._locked[key] === true;
    const argDefs = group.meta?.args || {};
    const argType = group.meta?.argTypes?.[key];

    // Get component class to check for enum definitions
    const componentName = group.meta?.component;
    const componentClass = componentName ? customElements.get(componentName) : null;

    // Check for enum in component's static properties
    const propEnum = componentClass?.properties?.[key]?.enum;
    const enumOptions = propEnum || argType?.options;

    // Select/dropdown control (from argTypes or property enum)
    if ((argType?.control === "select" || propEnum) && enumOptions) {
      return html`
        <fable-stack align-items="start">
          ${
            isLocked
              ? html`<fable-button
                variant="secondary"
                @click=${() => this._handleUnlock(key)}
              >
                🔓 Unlock ${key}
              </fable-button>`
              : ""
          }
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
                >`
            )}
          </fable-select>
        </fable-stack>
      `;
    }

    // Boolean checkbox
    if (typeof argDefs[key] === "boolean" || typeof val === "boolean") {
      return html`
        <fable-stack align-items="start">
          ${
            isLocked
              ? html`<fable-button
                variant="secondary"
                @click=${() => this._handleUnlock(key)}
              >
                🔓 Unlock ${key}
              </fable-button>`
              : ""
          }
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
        ${
          isLocked
            ? html`<fable-button
              variant="secondary"
              @click=${() => this._handleUnlock(key)}
            >
              🔓 Unlock ${key}
            </fable-button>`
            : ""
        }
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
            const displayVal = typeof val === "string" ? val : "[HTML Template]";
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
