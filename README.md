# fable

A lightweight component story viewer built with Lit web components, powered by Vite, and colocated stories.

Live demo: https://artmsilva.github.io/fable/

## What this repo contains

- **src/index.html** — app entry (Vite root)
- **src/style.css** — base design system styles and CSS variables
- **src/app.js** — main Lit app with three-panel layout (sidebar, preview, controls)
- **src/components/** — web components with colocated stories (prefix-free filenames)
  - `button.js` — button with variant attribute and slot content
  - `input.js` — input field with label
  - `card.js` — card container with title and slot
  - `link.js` — internal navigation link with active state
- **config/import-map.json** — canonical alias map consumed by the custom Vite plugin
- **plugins/import-map-plugin.ts** — registers the import-map aliases with Vite so existing specifiers keep working

## Architecture

### Colocated Stories

Stories are defined directly in component files using a simple pattern:

```javascript
// Component definition
class MyComponent extends LitElement { ... }
customElements.define('my-component', MyComponent);

// Stories registration
const meta = {
  title: "Component Name",
  component: "my-component",
  args: { prop: "default value" },    // Component properties
  slots: { default: "Slot content" }, // Slot content
};

const stories = {
  // Simple story (function)
  Default: (args, slots) => html`<my-component ...=${args}>${slots?.default}</my-component>`,

  // Story with locked args (object format)
  Disabled: {
    args: (baseArgs) => ({ ...baseArgs, disabled: true }),
    lockedArgs: { disabled: true }, // Marks args as hardcoded
    render: (args, slots) => html`<my-component ...></my-component>`,
  },
};

window.__FABLE_STORIES__ = window.__FABLE_STORIES__ || [];
window.__FABLE_STORIES__.push({ meta, stories });
```

### Story Controls

The app automatically generates controls based on story metadata:

- **Args** (properties): Text inputs for strings, checkboxes for booleans
- **Slots** (content): Multi-line textareas for editing slot content
- **Locked Args**: Disabled controls with 🔓 unlock button for hardcoded values

All arg changes update the URL for shareability. Slot changes are local UI state.

### Features

- **URL-based navigation** — Stories are shareable via query params
- **Browser history** — Back/forward navigation works
- **Live controls** — Edit props and slots in real-time
- **Locked args** — Visual indication of hardcoded story values with unlock option
- **Lit 3 native spread** — Uses `...=${}` syntax for spreading props

## Publish / GitHub Pages

This repository is configured to publish via GitHub Pages using the workflow at `.github/workflows/deploy-pages.yml`. The workflow uploads the repository root and deploys it to Pages on every push to the `main` branch.

After the workflow runs or Pages is enabled, the site will be available at:
`https://artmsilva.github.io/fable/`

## Local development

The project now relies on Vite for both development and production builds.

```bash
# Start the dev server with HMR at http://localhost:3000
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview the production build locally
npm run preview
```

Environment variables:

- `PORT` — override the dev server port (defaults to 3000)
- `HOST` — set `0.0.0.0` to expose on LAN
- `FABLE_BASE_PATH` — customize the base path used for routing and asset URLs (defaults to `/`). Create a `.env` file if you need to override locally; the Pages workflow sets this automatically to `/${REPO_NAME}/`.

## Linting and Formatting

This project uses [Biome](https://biomejs.dev/) for fast linting and formatting (no node_modules install required with npx):

```bash
# Auto-fix all issues
npm run check:fix
```

All commands use `npx @biomejs/biome` so no local installation is needed.

## Adding New Components

1. Create a new component file in `src/components/`
2. Define your web component
3. Add story metadata and stories at the bottom of the same file
4. Import the component in `src/app.js`

Example:

```javascript
// src/components/my-component.js
import { css, html, LitElement } from "lit";

class MyComponent extends LitElement {
  static properties = { text: { type: String } };
  render() {
    return html`<p>${this.text}</p>`;
  }
}
customElements.define("my-component", MyComponent);

const meta = {
  title: "My Component",
  args: { text: "Hello" },
};
const stories = {
  Default: (args) => html`<my-component text=${args.text}></my-component>`,
};
window.__FABLE_STORIES__ = window.__FABLE_STORIES__ || [];
window.__FABLE_STORIES__.push({ meta, stories });
```

Then add to `app.js`:

```javascript
import "./components/my-component.js";
```

## CDN Configuration

The project uses `esm.sh` for Lit imports instead of jsDelivr to support the full package including directives:

```json
{
  "imports": {
    "lit": "https://esm.sh/lit@3",
    "lit/": "https://esm.sh/lit@3/"
  }
}
```

This enables features like Lit 3's native spread syntax and all directives.

## Renaming the Project

This project is designed for easy renaming. See [RENAME_GUIDE.md](RENAME_GUIDE.md) for detailed instructions.

**Quick rename:**

```bash
./rename-project.sh yournewname
```

The project uses a centralized config file (`src/config.js`) that automatically handles:

- Global stories registry
- Theme storage keys
- Component registrations

## Next ideas

- Support named slots in controls
- Permutations - render stories with various permutations
- Docs story
- Homepage/discovery page
- Search and taxonomy support
- Hot module reload
- Better URL router using URLPattern
- Playground support, ability to compose new patterns and templates to share
- Design tokens support (docs and stories)
- Icons docs
