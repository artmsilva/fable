import { getSelectedRecipe } from "../store/index.js";
import { html, LitElement } from "lit";
import "../../ui/card.js";
import "../../ui/badge.js";
import "../../ui/preview.js";

export class FableRecipesView extends LitElement {
  static properties = {
    blueprint: { type: Object },
    selection: { type: Object },
    renderStory: { attribute: false },
    baseSlots: { attribute: false },
  };

  constructor() {
    super();
    this.blueprint = null;
    this.selection = getSelectedRecipe();
    this.renderStory = null;
    this.baseSlots = {};
  }

  createRenderRoot() {
    return this;
  }

  _isSelected(entry) {
    if (!this.selection) return false;
    return Object.entries(entry.selection).every(
      ([axisId, valueId]) => this.selection[axisId] === valueId
    );
  }

  _renderPreview(entry) {
    if (typeof this.renderStory !== "function") {
      return html`<p>No base story found for live preview.</p>`;
    }
    try {
      return this.renderStory(entry.args, this.baseSlots || {});
    } catch (error) {
      return html`<p>Failed to render recipe: ${error?.message || "Unknown error"}</p>`;
    }
  }

  _confidenceBadge(value) {
    if (value >= 0.75) {
      return { symbol: "📈", variant: "success", title: "High signal strength" };
    }
    if (value >= 0.4) {
      return { symbol: "📊", variant: "warning", title: "Medium signal strength" };
    }
    return { symbol: "⚠️", variant: "critical", title: "Low signal – verify manually" };
  }

  render() {
    if (!this.blueprint || !this.blueprint.axes?.length) {
      const warning = this.blueprint?.warnings?.[0] || "No recipes available for this component.";
      return html`<fable-card title="Recipes (Auto)">
        <p>${warning}</p>
      </fable-card>`;
    }

    const cases = this.blueprint.cases || [];
    const summary = `${cases.length} recipe${cases.length === 1 ? "" : "s"} inferred from ${this.blueprint.axes.length} axis${this.blueprint.axes.length === 1 ? "" : "es"}`;

    return html`
      <fable-card title="Recipes (Auto)">
        <div class="recipes-panel__header">
          <strong>${summary}</strong>
          ${
            this.blueprint.warnings?.length ? html`<p>${this.blueprint.warnings.join(" ")}</p>` : ""
          }
        </div>
        ${
          cases.length
            ? html`<div class="recipes-grid">
                ${cases.map(
                  (entry, index) => html`
                    <fable-card class="recipes-grid__item" data-recipe-id=${entry.id}>
                      <div class="recipes-card">
                        <div class="recipes-card__header">
                          <div class="recipes-card__title">Recipe ${index + 1}</div>
                          <div class="recipes-card__signals">
                            ${(() => {
                              const badge = this._confidenceBadge(entry.confidence);
                              return html`<fable-badge
                                variant=${badge.variant}
                                title=${badge.title}
                                aria-label=${badge.title}
                              >
                                ${badge.symbol}
                              </fable-badge>`;
                            })()}
                            ${
                              this._isSelected(entry)
                                ? html`<fable-badge variant="info">Selected</fable-badge>`
                                : ""
                            }
                          </div>
                        </div>
                        <div class="recipes-card__preview">
                          <fable-preview>
                            <div class="story-area">${this._renderPreview(entry)}</div>
                          </fable-preview>
                        </div>
                      </div>
                    </fable-card>
                  `
                )}
              </div>`
            : html`<p>No recipes were generated.</p>`
        }
      </fable-card>
    `;
  }
}

customElements.define("fable-recipes-view", FableRecipesView);
