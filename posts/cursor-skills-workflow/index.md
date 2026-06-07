---
layout: article
title: 使用 skills
type: Post
date_label: 2026-06-08
updated: 2026-06-08
category: 工程实践
summary: 记录把 Cursor Skills 放进项目后，如何让工具协作、内容维护和站点验证变成可复用流程。
words: 1300
views: 1
tags:
  - Cursor
  - Skills
  - 自动化
---

## 背景

`skills` 对我来说不是一个“收藏夹”，而是项目里的协作说明书。

它解决的问题很直接：

```text
相同类型的任务
→ 不希望每次重新解释背景
→ 把稳定流程写成 Skill
→ 之后按项目规则执行
```

在这个站点里，我更关心三类事情：

- 内容维护：文章、笔记、资料页和索引需要保持一致。
- 静态站点验证：页面、搜索、标签、文件链接不能因为一次更新被破坏。
- 工程边界：公开内容和私密内容必须分开，不能把 token、路径、账号信息发到站点里。

## 我的使用方式

我会把技能按“任务边界”拆开，而不是按工具名称拆开。

```text
添加文章
→ 读取内容索引
→ 判断放 posts / knowledge / files
→ 创建正文
→ 更新 data/content.json
→ 检查 JSON 和链接
```

```text
修改站点行为
→ 先确认影响范围
→ 改最小必要文件
→ 验证页面加载、搜索、标签、文件链接
```


## 当前公开备份

这次公开备份包含 86 个技能入口文件。

备份入口：[`Cursor Skills 备份`](/files/cursor-skills-public-copy/)

它不是完整安装包，而是一份可公开阅读的技能说明索引。


