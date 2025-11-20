import { css, html, LitElement } from "lit";

class FablrPreview extends LitElement {
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
      ); /** fablr-header height implemention in app */
      background-color: var(--bg-primary);
      position: relative;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("fablr-preview", FablrPreview);

// Stories
const meta = {
  title: "Preview",
  component: "fablr-preview",
  args: {},
};

const stories = {
  Default: (args) => html`
    <div>
      <fablr-preview>
        <h1>Preview Area</h1>
        <p>This is where component stories are displayed.</p>
        <fablr-button variant="primary">Example Button</fablr-button>
      </fablr-preview>
    </div>
  `,
};

if (!window.__FABLR_STORIES__) window.__FABLR_STORIES__ = [];
window.__FABLR_STORIES__.push({ meta, stories });
