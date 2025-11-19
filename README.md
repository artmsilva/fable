# Fablr

A Storybook clone using zero bundlers, import maps, and web components.

Live demo: https://artmsilva.github.io/Fablr/

## What this repo contains

- index.html — app entry with import map for Lit
- style.css — base styles
- app.js — main Lit app that mounts the story explorer
- components/ — web components (fablr-button, fablr-input, fablr-card)
- stories/ — self-registering story files and stories/index.js
- scripts/generate-stories-index.mjs — helper to regenerate stories/index.js

## Publish / GitHub Pages

This repository is configured to publish via GitHub Pages using the workflow at `.github/workflows/deploy-pages.yml`. The workflow uploads the repository root and deploys it to Pages on every push to the `main` branch.

If you prefer to enable Pages manually instead of using the workflow:
1. Go to the repository → Settings → Pages.
2. Choose Branch: `main` and Folder: `/ (root)`.
3. Save.

After the workflow runs or Pages is enabled, the site will be available at:
`https://artmsilva.github.io/Fablr/`

## Local development

Serve the repository root over HTTP (do not open via file://). Example:

- Quick (Python):
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

- Or with Node:
```bash
npx http-server -c-1 .
# open http://localhost:8080 (or port shown)
```

## Regenerate stories index

If you add new story files under `stories/`, run the generator to update `stories/index.js`:

```bash
node scripts/generate-stories-index.mjs
```

Commit the updated `stories/index.js` and push to trigger the Pages workflow.

## Troubleshooting

- If the site doesn't appear after deployment:
  - Check Actions → the deploy run logs for errors.
  - Ensure the repository is public (Pages on public repos is simplest).
  - Make sure `index.html` is at the published path (root by default).
- If you see 404s for component or story files in the browser console, verify the files exist at the same paths used by the imports (components/ and stories/).

## Next ideas (optional)
- Add a small live-reload dev server (no bundler) so the UI updates as you edit files.
- Improve controls (argTypes) and add more sample components and stories.
- Add a GitHub Pages custom domain (CNAME) if you want a custom hostname.
