---
name: galaxy-ai-proxy-integration
description: Maintain the AI proxy integration boundary for this Galaxy-A static site. Use this project skill whenever the user asks to add, change, debug, document, secure, test, or explain the AI section, proxy endpoint, request/response format, localStorage behavior, Cloudflare Worker/Vercel/Netlify/self-hosted proxy examples, or anything involving model API keys for this repository.
---

# Galaxy AI proxy integration

The site is static and must not contain model provider secrets. The browser only knows a user-provided proxy endpoint URL.

## Boundary

Frontend responsibilities:

- collect proxy endpoint URL from the user
- store only the endpoint URL under `galaxy-a-ai-endpoint`
- collect a question
- send the current content context from `data/content.json`
- render the proxy response as text

Proxy responsibilities:

- keep provider API keys in server-side environment variables
- call OpenAI, Claude, or another model provider
- return a simple response to the frontend

Never put API keys, bearer tokens, provider secrets, account IDs, or private credentials in:

- `index.html`
- `scripts/app.js`
- `data/content.json`
- `README.md`
- browser `localStorage`
- committed example files

## Existing frontend contract

The frontend sends:

```json
{
  "question": "用户问题",
  "context": {
    "site": {},
    "posts": [],
    "knowledge": [],
    "files": []
  }
}
```

Preferred proxy response:

```json
{
  "answer": "AI 返回内容"
}
```

The frontend also accepts plain text responses.

## Change rules

- Preserve the static-site boundary unless the user explicitly asks for a backend project.
- Keep the proxy URL user-configurable; do not hard-code a private endpoint unless the user explicitly asks and confirms it is public-safe.
- If adding examples, use placeholder domains and environment variable names.
- If documenting deployment, prefer Cloudflare Worker, Vercel Function, Netlify Function, or self-hosted API as proxy options.
- If changing request shape, update both `scripts/app.js` and `README.md` so they stay aligned.
- If adding error behavior, keep messages useful but avoid leaking sensitive response details.

## Verification

When AI behavior changes:

1. Confirm no secrets were added to tracked files.
2. Confirm the frontend still sends only `{ question, context }` to the configured endpoint unless the user asked otherwise.
3. Confirm JSON responses with `answer` display correctly.
4. Confirm plain text responses display correctly.
5. Confirm failed responses show a user-visible error.

Use WSL-first commands for local checks in this project.