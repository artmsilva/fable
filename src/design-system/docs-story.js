import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";
import { getAllComponentMetadata } from "../config/metadata-registry.js";
import { getStories } from "../store/index.js";

const findStoryEntry = (componentId, storyName) => {
  const stories = getStories() || [];
  const metadata = getAllComponentMetadata().find(
    (meta) => meta.id === componentId,
  );

  const candidates = new Set(
    [
      metadata?.id,
      componentId,
      metadata?.storyGroup,
      metadata?.title,
      metadata?.component,
      metadata?.component?.replace(/^fable-/, ""),
    ]
      .filter(Boolean)
      .map((val) => val.toLowerCase()),
  );

  let groupIndex = -1;
  let storyGroup = null;
  stories.some((group, index) => {
    const metaValues = [
      group?.meta?.id,
      group?.meta?.title,
      group?.meta?.storyGroup,
      group?.meta?.component,
      group?.meta?.component?.replace(/^fable-/, ""),
    ]
      .filter(Boolean)
      .map((val) => val.toLowerCase());

    const hit = metaValues.some((val) => candidates.has(val));
    if (hit) {
      groupIndex = index;
      storyGroup = group;
      return true;
    }
    return false;
  });

  if (!storyGroup || groupIndex < 0) {
    console.warn("Docs story embed: component match not found", {
      componentId,
      candidates: [...candidates],
      available: stories.map((g) => g?.meta?.title || g?.meta?.id || "unknown"),
    });
    return null;
  }

  const storyKeys = Object.keys(storyGroup.stories || {});
  let selectedStoryName = storyKeys[0];
  if (storyName) {
    if (storyGroup.stories?.[storyName]) {
      selectedStoryName = storyName;
    } else {
      const matchKey =
        storyKeys.find(
          (key) => key.toLowerCase() === storyName.toLowerCase(),
        ) || storyKeys[0];
      selectedStoryName = matchKey;
    }
  }
  const story = storyGroup.stories?.[selectedStoryName];
  if (!story) return null;

  const baseArgs = { ...(storyGroup.meta?.args || {}) };
  const args =
    typeof story === "object" && typeof story.args === "function"
      ? story.args(baseArgs)
      : baseArgs;
  const renderFn = typeof story === "function" ? story : story.render;
  const slots = storyGroup.meta?.slots || {};

  return {
    renderFn,
    args,
    slots,
    storyName: selectedStoryName,
    meta: storyGroup.meta,
  };
};

class FableDocsStory extends LitElement {
  static properties = {
    componentId: { type: String, attribute: "component-id" },
    story: { type: String },
    _content: { state: true },
    _title: { state: true },
    _debug: { state: true },
  };

  constructor() {
    super();
    this.componentId = "";
    this.story = "";
    this._content = null;
    this._title = "";
    this._debug = "";
    this._handleStateChange = this._handleStateChange.bind(this);
  }

  static styles = css`
    :host {
      display: block;
      border: 1px solid var(--border-color);
      border-radius: var(--radius, 12px);
      padding: var(--space-4, 20px);
      margin: var(--space-4, 20px) 0;
      background: var(--bg-secondary);
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-3, 16px);
      color: var(--text-primary);
    }
    h4 {
      margin: 0;
      font-size: 1rem;
    }
    .preview {
      padding: var(--space-3, 16px);
      background: var(--bg-primary);
      border-radius: var(--radius, 12px);
      border: 1px dashed var(--border-color);
    }
    .meta {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin: 0;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("state-changed", this._handleStateChange);
    this._hydrate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("state-changed", this._handleStateChange);
  }

  updated(changed) {
    if (changed.has("componentId") || changed.has("story")) {
      this._hydrate();
    }
  }

  _handleStateChange(event) {
    if (event.detail?.key === "stories") {
      this._hydrate();
    }
  }

  _hydrate() {
    let component = this.componentId;
    let storyName = this.story;
    if (!storyName && component?.includes("--")) {
      const [idPart, storyPart] = component.split("--");
      component = idPart;
      storyName = storyPart;
    }

    const entry = findStoryEntry(component, storyName);
    if (!entry) {
      const debugMessage = `Docs story embed not found for component="${component}" story="${
        storyName || "(default)"
      }"`;
      console.warn(debugMessage, {
        componentId: component,
        story: storyName,
      });
      this._content = html`<p class="meta">${debugMessage}</p>`;
      this._title = "Story not found";
      this._debug = debugMessage;
      return;
    }
    this._content = entry.renderFn(entry.args, entry.slots);
    this._title = entry.meta?.title
      ? `${entry.meta.title} — ${entry.storyName}`
      : entry.storyName;
    this._debug = "";
  }

  render() {
    return html`
      <header>
        <h4>${this._title || "Story"}</h4>
        <p class="meta">
          ${this.componentId}${this.story ? ` • ${this.story}` : ""}
          ${this._debug ? `(${this._debug})` : ""}
        </p>
      </header>
      <div class="preview">${this._content}</div>
    `;
  }
}

customElements.define("fable-docs-story", FableDocsStory);
