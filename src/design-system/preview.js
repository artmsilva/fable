import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";
import { getComponentStoryMeta } from "../metadata/components.js";

class FablePreview extends LitElement {
  static status = "stable";

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
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("fable-preview", FablePreview);

// Stories
const meta = getComponentStoryMeta("preview", {
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
