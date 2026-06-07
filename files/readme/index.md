---
layout: article
title: 公开资料说明
type: Archive
category: 资料
kind: txt
summary: 说明公开资料目录的用途和文件大小约束。
tags:
  - 说明
  - 资料
---

## 目录用途

`assets/files/` 用于存放可以公开访问的小文件，适合配合文章、笔记或资料索引使用。

## 推荐内容

- PDF 速查表
- 示例代码压缩包
- 图片素材
- 配置模板
- 轻量数据样例

## 维护方式

1. 把文件放入 `assets/files/`。
2. 在 `data/content.json` 的 `files` 数组中新增索引。
3. 让索引指向独立说明页或原始文件。
4. 提交到 GitHub 仓库，由 GitHub Pages 自动托管。

## 约束

公开资料只放可公开分享的轻量文件。建议单文件不超过 10MB，不放私密信息、访问凭据或临时调试产物。