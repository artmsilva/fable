import { css, html, LitElement } from "lit";
import "./checkbox.js";
import "./select.js";
import "./input.js";
import "./button.js";

/**
 * Interactive attributes table for component properties.
 * Renders each property as a row with name, type, default, and control.
 */
class FableAttributesTable extends LitElement {
  static properties = {
    component: { type: String },
    args: { type: Object },
    lockedArgs: { type: Object },
    argTypes: { type: Object },
    argDefs: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm, 0.875rem);
    }
    thead th {
      text-align: left;
      padding: var(--space-2, 8px) var(--space-3, 12px);
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 2px solid var(--border-color);
      font-size: var(--font-size-xs, 0.75rem);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    tbody tr {
      border-bottom: 1px solid var(--border-color);
    }
    tbody tr:nth-child(even) {
      background: color-mix(in srgb, var(--bg-secondary) 40%, transparent);
    }
    td {
      padding: var(--space-2, 8px) var(--space-3, 12px);
      vertical-align: middle;
    }
    .prop-name {
      font-family: var(--font-stack);
      font-weight: 500;
      color: var(--text-primary);
    }
    .prop-type {
      font-family: var(--font-stack);
      color: var(--text-secondary);
      font-size: var(--font-size-xs, 0.75rem);
    }
    .prop-default {
      font-family: var(--font-stack);
      color: var(--text-secondary);
      font-size: var(--font-size-xs, 0.75rem);
    }
    .control-cell {
      min-width: 140px;
    }
    .empty {
      padding: var(--space-4, 16px);
      color: var(--text-secondary);
      text-align: center;
    }
  `;

  constructor() {
    super();
    this.component = "";
    this.args = {};
    this.lockedArgs = {};
    this.argTypes = {};
    this.argDefs = {};
  }

  _getPropertyType(key) {
    const val = this.argDefs[key];
    const componentClass = this.component ? customElements.get(this.component) : null;
    const propEnum = componentClass?.properties?.[key]?.enum;
    const argType = this.argTypes?.[key];

    if ((argType?.control === "select" || propEnum) && (propEnum || argType?.options)) {
      const opts = propEnum || argType.options;
      return opts.join(" | ");
    }
    if (typeof val === "boolean") return "boolean";
    if (typeof val === "number") return "number";
    return "string";
  }

  _getDefaultDisplay(key) {
    const val = this.argDefs[key];
    if (val === undefined || val === null) return "-";
    if (typeof val === "boolean") return String(val);
    if (typeof val === "string") return val ? `"${val}"` : '""';
    return String(val);
  }

  _renderControl(key) {
    const val = this.args[key];
    const isLocked = this.lockedArgs[key] === true;
    const componentClass = this.component ? customElements.get(this.component) : null;
    const propEnum = componentClass?.properties?.[key]?.enum;
    const argType = this.argTypes?.[key];
    const enumOptions = propEnum || argType?.options;

    if (isLocked) {
      return html`<fable-button
        variant="secondary"
        @click=${() => this._dispatchUnlock(key)}
      >Unlock</fable-button>`;
    }

    if ((argType?.control === "select" || propEnum) && enumOptions) {
      return html`<fable-select
        .value=${val}
        @change=${(e) => this._dispatchArgChange(key, e.detail)}
      >${enumOptions.map(
        (opt) => html`<fable-select-option value=${opt}>${opt}</fable-select-option>`
      )}</fable-select>`;
    }

    if (typeof this.argDefs[key] === "boolean" || typeof val === "boolean") {
      return html`<fable-checkbox
        ?checked=${!!val}
        @change=${(e) => this._dispatchArgChange(key, e.detail)}
      ></fable-checkbox>`;
    }

    return html`<fable-input
      .value=${val ?? ""}
      @input=${(e) => this._dispatchArgChange(key, e.detail)}
    ></fable-input>`;
  }

  _dispatchArgChange(key, value) {
    this.dispatchEvent(new CustomEvent("arg-change", { detail: { key, value }, bubbles: true }));
  }

  _dispatchUnlock(key) {
    this.dispatchEvent(new CustomEvent("arg-unlock", { detail: { key }, bubbles: true }));
  }

  render() {
    const keys = Object.keys(this.argDefs);
    if (!keys.length) {
      return html`<p class="empty">No configurable properties.</p>`;
    }

    return html`
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Default</th>
            <th>Control</th>
          </tr>
        </thead>
        <tbody>
          ${keys.map(
            (key) => html`
              <tr>
                <td class="prop-name">${key}</td>
                <td class="prop-type">${this._getPropertyType(key)}</td>
                <td class="prop-default">${this._getDefaultDisplay(key)}</td>
                <td class="control-cell">${this._renderControl(key)}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }
}

customElements.define("fable-attributes-table", FableAttributesTable);
