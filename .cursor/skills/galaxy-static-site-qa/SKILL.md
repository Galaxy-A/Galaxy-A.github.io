---
name: galaxy-static-site-qa
description: Verify this Galaxy-A static GitHub Pages site after HTML, CSS, JavaScript, content JSON, routing, search, tag filtering, file links, or README deployment changes. Use this project skill whenever the user asks to preview, test, check, validate, fix page behavior, inspect UI, verify GitHub Pages readiness, or ensure the site still works after edits.
---

# Galaxy static site QA

This project is a pure static site served from the repository root. The runtime path is:

- `index.html`
- `styles/site.css`
- `scripts/app.js`
- `data/content.json`
- `assets/files/*`

## What to verify

Check the narrowest path affected by the change, then expand only when needed.

Core checks:

- `index.html` loads without missing local assets.
- `data/content.json` is valid JSON and fetchable from the browser.
- Search renders all content types: posts, knowledge, and files.
- Type filter and tag chips narrow results correctly.
- Static sections render blog, knowledge, and file cards.
- File links use safe relative paths and open/download correctly.
- README deployment assumptions still match the actual structure.

AI area checks, when affected:

- The page never stores model keys.
- Only the proxy endpoint URL is stored in `localStorage`.
- The frontend sends `{ question, context }` to the configured proxy.
- JSON and text proxy responses both display safely as text.

## Local preview

Follow the project WSL-first rule for local commands.

Start a static server from the repository root:

```powershell
wsl.exe bash -lc 'cd /mnt/d/Project/Galaxy-A.github.io && python3 -m http.server 8080'
```

Then verify `http://localhost:8080`.

If port `8080` is occupied, use another port and keep the URL consistent in the report.

## Browser verification

Use browser runtime checks when behavior depends on rendering, fetch, localStorage, form submission, or navigation.

Recommended manual flow:

1. Open the local preview URL.
2. Confirm there are no console errors for missing files or JSON parsing.
3. Search for a known term from `data/content.json`.
4. Switch the type filter between all content types.
5. Click a tag chip.
6. Open a file card link.
7. If AI behavior changed, use a harmless local/mock proxy or inspect the outgoing request shape.

## Reporting format

Report only what matters:

- Preview URL used
- Checks passed
- Issues found, with affected area
- Any command/runtime limitation, such as missing WSL, missing Python, or blocked port