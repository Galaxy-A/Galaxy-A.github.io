# Galaxy-A Blog

一个可部署到 GitHub Pages 的 Jekyll 静态博客。当前站点按真实博客形态组织：首页展示文章卡片流，正文进入独立文章页，归档、分类、标签、关于和搜索各自独立。

## 功能范围

- 首页文章卡片流：封面、标题、摘要、发布时间、分类和标签
- 独立文章页：正文阅读、发布时间、更新时间、分类、标签、字数和阅读量
- 归档页：按年份分组的文章时间线
- 分类页和标签页：按主题聚合内容
- 右侧栏：作者信息、公告、Follow Me、最新文章、分类、标签云、归档和网站信息
- 页脚：版权、运行天数、文章数、字数、访问量、Jekyll/GitHub Pages 信息
- 搜索页：基于 `data/content.json` 的浏览器端站内搜索
- 右下角工具按钮：返回顶部和搜索入口

## 项目结构

```text
.
├── .github/workflows/          # GitHub Pages Jekyll 部署流程
├── _includes/                  # 公共模块：顶部、侧栏、页脚
│   ├── sidebar.html
│   ├── site-footer.html
│   └── site-header.html
├── _layouts/                   # 页面布局
│   ├── article.html            # 文章详情页布局
│   ├── default.html            # 全站外壳
│   └── page.html               # 普通页面布局
├── about/                      # 关于页
├── archives/                   # 归档页
├── assets/images/              # 头像、封面和默认图片
├── categories/                 # 分类页
├── data/content.json           # 站点信息和内容索引
├── files/                      # 公开资料说明页
├── notes/                      # 笔记详情页
├── posts/                      # 文章详情页
├── scripts/app.js              # 搜索页交互
├── search/                     # 搜索页
├── styles/site.css             # 全站样式
├── tags/                       # 标签页
├── _config.yml                 # Jekyll 站点配置
├── Gemfile                     # GitHub Pages/Jekyll 依赖
├── index.html                  # 首页
└── README.md
```

## 页面关系

```text
data/content.json
  ├─ 首页文章卡片
  ├─ 归档页时间线
  ├─ 分类页聚合
  ├─ 标签页聚合
  ├─ 侧栏最新文章/分类/标签/归档
  ├─ 页脚统计
  └─ 搜索页索引

posts/、notes/、files/
  └─ 独立正文页面，使用 _layouts/article.html
```

首页只负责发现内容；正文内容放在独立页面中。这样可以避免首页弹窗式阅读，也更接近常规博客的访问路径。

## 内容维护

核心索引在 `data/content.json`。新增内容时，通常需要同时维护两处：

1. 在 `data/content.json` 中增加卡片、归档、搜索和侧栏所需的索引信息。
2. 在 `posts/`、`notes/` 或 `files/` 下新增独立 Markdown 页面。

### `data/content.json` 字段

```json
{
  "id": "my-post-id",
  "title": "文章标题",
  "date": "2026-06-04",
  "updated": "2026-06-07",
  "year": "2026",
  "category": "工程实践",
  "summary": "文章摘要。",
  "tags": ["GitHub Pages", "静态站点", "博客"],
  "url": "/posts/my-post-id/",
  "cover": "/assets/images/default.svg",
  "words": "1.2k",
  "views": "100",
  "content": "用于搜索的关键词和正文摘要"
}
```

字段用途：

- `id`：内容唯一标识
- `title`：标题
- `date`：发布时间
- `updated`：更新时间
- `year`：归档年份
- `category`：分类
- `summary`：首页卡片和搜索结果摘要
- `tags`：标签
- `url`：独立内容页地址
- `cover`：首页、归档和侧栏封面图
- `words`：字数展示
- `views`：阅读量展示
- `content`：浏览器端搜索用文本

### 独立文章页示例

推荐路径：

```text
posts/my-post-id/index.md
```

示例内容：

```markdown
---
layout: article
title: 文章标题
type: Post
date_label: 2026-06-04
updated: 2026-06-07
category: 工程实践
summary: 文章摘要。
words: 1.2k
views: 100
tags:
  - GitHub Pages
  - 静态站点
  - 博客
---

## 小节标题

这里写正文。
```

`data/content.json` 负责列表、归档、分类、标签、侧栏和搜索；Markdown front matter 负责文章详情页顶部元信息。

## 站点信息维护

顶部统计条、侧栏网站信息和页脚统计来自 `data/content.json` 的 `site` 字段：

```json
{
  "title": "Galaxy-A Blog",
  "owner": "Galaxy-A",
  "description": "个人博客、工程札记与公开资料索引。",
  "bio": "Software Engineer · Engineering Notes · Long-term Thinking",
  "notice": "即使再小的帆也能远航 ⛵",
  "avatar": "/assets/images/avatar.svg",
  "github": "https://github.com/Galaxy-A",
  "visitors": "5995",
  "views": "10778",
  "updated": "刚刚",
  "created": "2026-06-04",
  "running_days": "3",
  "words": "8.2k"
}
```

## 搜索机制

搜索页只在 `/search/` 使用 `scripts/app.js`。脚本读取 `data/content.json`，把以下内容合并为浏览器端搜索索引：

- 标题
- 摘要
- 标签
- 分类
- 文件类型和大小
- `content` 搜索片段

搜索不依赖后端，适合个人博客和中小规模内容索引。

## 图片资源

当前默认图片位于 `assets/images/`：

- `avatar.svg`：头像
- `background.svg`：首页重点文章封面
- `default.svg`：默认封面

新增文章时优先在 `data/content.json` 的 `cover` 字段中使用公开静态路径。

## GitHub Pages 部署

当前项目使用 Jekyll 模式，通过 GitHub Actions 构建并发布。

部署链路：

```text
main 分支提交
  ↓
.github/workflows/jekyll-pages.yml
  ↓
Jekyll 构建到 _site/
  ↓
GitHub Pages 发布
```

部署检查项：

- `index.html` 带有 Jekyll front matter。
- `_layouts/default.html` 提供全站外壳，并统一挂载页脚和脚本。
- `_includes/site-header.html`、`_includes/sidebar.html`、`_includes/site-footer.html` 存在。
- `_layouts/article.html` 提供独立文章页结构。
- `_config.yml` 中的 `url` 是 `https://galaxy-a.github.io`。
- `Gemfile` 使用 GitHub Pages 支持的 Jekyll 依赖。
- `data/content.json`、`scripts/app.js` 和 `styles/site.css` 保持公开静态路径。

## 本地预览

本项目在 Windows 路径下编辑，推荐通过 WSL 运行本地开发命令。

如果 WSL 已可用，进入项目目录：

```bash
cd /mnt/d/Project/Galaxy-A.github.io
```

安装依赖并启动 Jekyll：

```bash
bundle install
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

然后访问 `http://127.0.0.1:4000`。

如果当前环境没有 Ruby/Jekyll，可以先做静态数据校验：

```bash
python3 -m json.tool data/content.json >/dev/null
```

最终构建结果以 GitHub Pages 或本地 Jekyll 构建为准。
