# Fablr

A lightweight component story viewer built with Lit web components, zero bundlers, and colocated stories.

Live demo: https://artmsilva.github.io/Fablr/

## What this repo contains

- **index.html** — app entry with import map for Lit (via esm.sh CDN)
- **style.css** — base design system styles and CSS variables
- **app.js** — main Lit app with three-panel layout (sidebar, preview, controls)
- **components/** — web components with colocated stories
  - `fablr-button.js` — button with variant attribute and slot content
  - `fablr-input.js` — input field with label
  - `fablr-card.js` — card container with title and slot
  - `fablr-link.js` — internal navigation link with active state

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

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
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
- **Zero build step** — Import maps + native ES modules
- **Lit 3 native spread** — Uses `...=${}` syntax for spreading props

## Publish / GitHub Pages

This repository is configured to publish via GitHub Pages using the workflow at `.github/workflows/deploy-pages.yml`. The workflow uploads the repository root and deploys it to Pages on every push to the `main` branch.

After the workflow runs or Pages is enabled, the site will be available at:
`https://artmsilva.github.io/Fablr/`

## Local development

Serve the repository root over HTTP (do not open via file://).

### Development Server (Recommended)

The project includes a custom Node.js TypeScript development server with zero dependencies:

```bash
# Start the dev server
npm run dev

# Server runs at http://localhost:3000
# Set PORT and HOST environment variables to customize
```

**Features:**

- **Live Hot Reload** — automatically refreshes browser when files change
- TypeScript support using Node.js 24+ native type stripping
- Proper MIME types for ES modules
- Security protections (path traversal prevention)
- Custom 404 page with gradient styling
- Request logging with color-coded status
- HEAD request support
- Server-Sent Events (SSE) for reload notifications
- Recursive file watching with smart debouncing
- No third-party dependencies

**Live Reload Configuration:**

```bash
# Disable live reload (enabled by default)
LIVE_RELOAD=false npm run dev

# Custom port and host
PORT=8080 HOST=0.0.0.0 npm run dev
```

The live reload feature:

- Watches all files in the project directory recursively
- Automatically injects reload script into HTML files
- Uses Server-Sent Events for instant browser updates
- Ignores `node_modules`, `.git`, and server files
- Debounces multiple rapid changes (100ms)

## Linting and Formatting

This project uses [Biome](https://biomejs.dev/) for fast linting and formatting (no node_modules install required with npx):

```bash
# Auto-fix all issues
npm run check:fix
```

All commands use `npx @biomejs/biome` so no local installation is needed.

## Adding New Components

1. Create a new component file in `components/`
2. Define your web component
3. Add story metadata and stories at the bottom of the same file
4. Import the component in `app.js`

Example:

```javascript
// components/my-component.js
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
window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
```

Then add to `app.js`:

```javascript
import "./components/my-component.js";
```

## Troubleshooting

- If the site doesn't appear after deployment:
  - Check Actions → the deploy run logs for errors.
  - Ensure the repository is public (Pages on public repos is simplest).
  - Make sure `index.html` is at the published path (root by default).
- If you see 404s for component files in the browser console, verify the files exist at the same paths used by the imports (components/).

## Project Structure

```
Fablr/
├── index.html              # Entry point with import map
├── style.css              # Design system CSS variables
├── app.js                 # Main app with story explorer
├── server.ts              # Dev server with live reload
├── 404.html               # Custom 404 page
└── components/            # Web components with colocated stories
    ├── fablr-button.js
    ├── fablr-card.js
    ├── fablr-input.js
    └── fablr-link.js
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

## Next ideas (optional)

- Add select/dropdown controls for enum-like args
- Support named slots in controls
- Add JSDoc extraction for automatic arg documentation
- Theme switcher for testing components in different modes
