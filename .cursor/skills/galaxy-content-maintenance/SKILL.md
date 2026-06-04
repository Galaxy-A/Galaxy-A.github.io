---
name: galaxy-content-maintenance
description: Maintain this Galaxy-A GitHub Pages knowledge base content model. Use this project skill whenever the user asks to add, edit, remove, reorganize, validate, or explain blog posts, knowledge notes, file indexes, tags, categories, search text, or assets under data/content.json and assets/files. Always use this skill for content/index changes in this repository, even when the user only says “加一篇文章”, “添加文件”, “更新知识库”, “整理标签”, or “改内容”.
---

# Galaxy content maintenance

This repository is a static GitHub Pages knowledge base. The content source of truth is `data/content.json`; small linked files live under `assets/files/`.

## Scope

Use this skill for changes involving:

- blog entries in `posts`
- knowledge entries in `knowledge`
- file entries in `files`
- tags, categories, dates, summaries, URLs, and searchable `content`
- files under `assets/files/`
- README examples that describe the content model

## Content model

Keep the top-level shape stable:

```json
{
  "site": {},
  "posts": [],
  "knowledge": [],
  "files": []
}
```

Required entry fields:

- `posts`: `id`, `title`, `date`, `summary`, `tags`, `url`, `content`
- `knowledge`: `id`, `title`, `category`, `summary`, `tags`, `url`, `content`
- `files`: `id`, `title`, `size`, `kind`, `summary`, `tags`, `url`, `content`

## Maintenance rules

- Use stable kebab-case `id` values.
- Prefer concise Chinese titles and summaries unless the user provides English content.
- Keep `tags` short and reusable; avoid one-off noisy tags.
- Keep `content` useful for search: include keywords, commands, concepts, and aliases that users may search for.
- For internal page anchors, use `#posts`, `#knowledge`, `#files`, `#ai`, or `#search`.
- For local files, use relative URLs like `assets/files/example.pdf`.
- Do not add private files, API keys, tokens, credentials, or account data.
- Keep files in `assets/files/` at or below the project’s 10MB guideline unless the user explicitly chooses an external link strategy.

## Edit workflow

1. Read `data/content.json` and any referenced file before editing.
2. Decide which collection owns the item: blog, knowledge, or file.
3. Preserve the existing JSON shape and ordering style.
4. Update related file links when adding or renaming assets.
5. Validate JSON after editing.
6. If the change affects user-facing docs, update `README.md` only when necessary.

## WSL command convention

For validation commands in this Windows workspace, follow the project WSL-first rule. Example:

```powershell
wsl.exe bash -lc 'cd /mnt/d/Project/Galaxy-A.github.io && python3 -m json.tool data/content.json >/dev/null'
```