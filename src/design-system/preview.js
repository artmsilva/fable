import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";
import { getComponentStoryMeta } from "../metadata/components.js";

class FablePreview extends LitElement {
  static status = "stable";
  static description = "Container used to showcase stories with chrome controls.";
  static taxonomy = { group: "Foundations", tags: ["preview", "docs"] };

  static properties = {};

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      width: 100%;
      height: 100%;
      padding: var(--space-4, 16px);
      box-sizing: border-box;
      background-color: var(--bg-primary);
      position: relative;
      overflow: auto;
      border: 1px solid var(--border-color, #d6cdb8);
      border-radius: var(--radius, 8px);
      box-shadow:
        0 1px 3px rgba(28, 25, 23, 0.04),
        0 4px 16px rgba(28, 25, 23, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("fable-preview", FablePreview);

// Stories
const meta = getComponentStoryMeta("preview", {
  title: "Preview Frame",
  args: {},
});

const stories = {
  Default: (_args) => html`
    <div>
      <fable-preview>
        <h1>Preview Area</h1>
        <p>This is where component stories are displayed.</p>
        <fable-button variant="primary">Example Button</fable-button>
      </fable-preview>
    </div>
  `,
};

if (!window[STORIES_KEY]) window[STORIES_KEY] = [];
window[STORIES_KEY].push({ meta, stories });
