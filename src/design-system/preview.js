import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";

class FablePreview extends LitElement {
  static status = "stable";

  static properties = {};

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0;
      height: calc(
        100vh - 100px
      ); /** fable-header height implemention in app */
      background-color: var(--bg-primary);
      position: relative;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("fable-preview", FablePreview);

// Stories
const meta = {
  title: "Preview",
  component: "fable-preview",
  args: {},
};

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
