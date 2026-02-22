# Fable

Design-system workbench built with Lit 3 and Vite. Ships a story explorer with args/recipe controls and URL-synced state.

Live demo: [artmsilva.github.io/fable](https://artmsilva.github.io/fable/)

## Monorepo Structure

```
packages/
  fable/          # Core library + Vite plugin (published as fable-workbench)
    src/           # App shell, router, store, utilities
    ui/            # Built-in UI primitives (button, card, sidebar, etc.)
  demo/           # Example consumer app (deployed to GitHub Pages)
```

## Using the Vite Plugin

Fable is consumed as a Vite plugin. A host app needs three things:

### 1. Install

```bash
npm install fable-workbench vite
```

Or in a monorepo, add `"fable-workbench": "*"` to your app's `dependencies`.

### 2. Configure Vite

```js
// vite.config.js
import path from "node:path";
import { fable } from "fable-workbench/plugin";

export default {
  root: path.resolve(import.meta.dirname, "src"),
  base: process.env.FABLE_BASE_PATH || "/",
  plugins: [fable({ showBuiltins: true })],
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
};
```

#### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showBuiltins` | `boolean` | `false` | Show Fable's built-in UI component stories (button, card, sidebar, etc.) in the navigator. Useful for exploring the workbench's own design system. |

### 3. Bootstrap

Create an HTML entry and a JS entry:

```html
<!-- src/index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Workbench</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

```js
// src/main.js
import "fable-workbench/style.css";
import "fable-workbench";
```

That's it. Run `vite` and you get the full workbench UI.

### Registering Components

Use the `define` helper to register a Lit component with stories:

```js
import { define } from "fable-workbench";
import { LitElement, html, css } from "lit";

class MyButton extends LitElement {
  static title = "Button";
  static description = "A clickable button.";
  static status = "stable";
  static taxonomy = { group: "Actions", category: "Inputs" };

  static args = { label: "Click me", variant: "primary" };
  static argTypes = {
    variant: { options: ["primary", "secondary", "ghost"] },
  };

  static stories = {
    Default: (args) => html`<my-button>${args.label}</my-button>`,
    WithIcon: {
      args: { label: "Save" },
      render: (args) => html`<my-button>&#128190; ${args.label}</my-button>`,
    },
  };

  static styles = css`/* ... */`;
  render() { return html`<button><slot></slot></button>`; }
}

define("my-button", MyButton);
```

### Custom Theming

Override the workbench's look by loading a CSS file after the base styles. Every custom property is optional — only set the ones you want to change.

```js
// src/main.js
import "fable-workbench/style.css";
import "./theme.css"; // your overrides
import "fable-workbench";
```

```css
/* src/theme.css */
:root {
  --font-stack: "Inter", system-ui, sans-serif;
  --primary-color: #0369a1;
  --bg-primary: #f8fafc;
  --bg-secondary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --border-color: #cbd5e1;
  --shadow-color: rgba(15, 23, 42, 0.06);
}
```

See `packages/demo/src/theme.css` for a full example with dark mode support.

### Environment Variables

- `FABLE_BASE_PATH` -- deployed base path (default `/`, GitHub Pages sets `/<repo>/`).
- `PORT` -- dev server port (default `3000`).

## Development (This Repo)

```bash
npm install
npm run dev        # HMR at http://localhost:3000
npm run build      # Static export to packages/demo/dist/
```

## Architecture

- **Lit 3** web components with vanilla JS (ES modules). No transpiler beyond Vite.
- **Two-column layout**: sidebar navigator (left) + main content (right).
- **URLPattern router** in `packages/fable/src/router.js`. Story URLs: `/components/:group?prop=value&recipe=axis.value`.
- **Singleton store** in `packages/fable/src/store/app-store.js`. Components listen for `"state-changed"` events on `window`.
- **Vite plugin** (`packages/fable/src/plugin.js`) sets up resolve aliases so consumers import from `fable-workbench`, `fable-workbench/plugin`, and `fable-workbench/style.css`.

## Deployment

- The demo app deploys to GitHub Pages via `.github/workflows/static.yml`.
- The `404.html` SPA fallback saves the path to `sessionStorage`; `app.js` restores it on load.
- Builds are static; `packages/demo/dist/` is the deploy artifact.
