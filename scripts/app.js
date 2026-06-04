const DATA_URL = "data/content.json";

const state = {
  data: null,
  items: [],
  activeTag: "all",
  query: "",
  type: "all",
};

const dom = {
  searchInput: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  tagCloud: document.querySelector("#tagCloud"),
  results: document.querySelector("#results"),
  postList: document.querySelector("#postList"),
  knowledgeList: document.querySelector("#knowledgeList"),
  fileList: document.querySelector("#fileList"),
  cardTemplate: document.querySelector("#cardTemplate"),
};

const typeLabels = {
  post: "文章",
  knowledge: "笔记",
  file: "资料",
};

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const flattenTags = (items) =>
  [...new Set(items.flatMap((item) => item.tags ?? []))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );

const markdownToText = (markdown = "") =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#>*_\-[\]()|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toSearchText = (item) =>
  normalize([
    item.title,
    item.summary,
    item.content,
    item.category,
    item.kind,
    item.size,
    item.markdownText,
    ...(item.tags ?? []),
  ].join(" "));

const toItems = (data) => [
  ...(data.posts ?? []).map((item) => ({ ...item, type: "post" })),
  ...(data.knowledge ?? []).map((item) => ({ ...item, type: "knowledge" })),
  ...(data.files ?? []).map((item) => ({ ...item, type: "file" })),
];

const formatMeta = (item) => {
  if (item.type === "post") return [typeLabels[item.type], item.date].filter(Boolean);
  if (item.type === "knowledge") return [typeLabels[item.type], item.category].filter(Boolean);
  return [typeLabels[item.type], item.kind, item.size].filter(Boolean);
};

const setEmpty = (target, message) => {
  target.innerHTML = `<div class="empty-state">${message}</div>`;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const inlineMarkdown = (value) =>
  escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

const flushList = (html, list) => {
  if (!list.items.length) return;
  html.push(`<${list.type}>`, ...list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`), `</${list.type}>`);
  list.items = [];
  list.type = null;
};

const markdownToHtml = (markdown = "") => {
  const html = [];
  const list = { type: null, items: [] };
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let codeBlock = null;

  for (const line of lines) {
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      if (codeBlock) {
        html.push(`<pre><code>${escapeHtml(codeBlock.lines.join("\n"))}</code></pre>`);
        codeBlock = null;
      } else {
        flushList(html, list);
        codeBlock = { lang: fence[1] ?? "", lines: [] };
      }
      continue;
    }

    if (codeBlock) {
      codeBlock.lines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushList(html, list);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushList(html, list);
      const level = heading[1].length + 3;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      if (list.type !== "ol") flushList(html, list);
      list.type = "ol";
      list.items.push(ordered[1]);
      continue;
    }

    const unordered = line.match(/^-\s+(.+)$/);
    if (unordered) {
      if (list.type !== "ul") flushList(html, list);
      list.type = "ul";
      list.items.push(unordered[1]);
      continue;
    }

    flushList(html, list);
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  if (codeBlock) html.push(`<pre><code>${escapeHtml(codeBlock.lines.join("\n"))}</code></pre>`);
  flushList(html, list);

  return html.join("");
};

const loadMarkdownSource = async (item) => {
  if (!item.source) return item;

  try {
    const response = await fetch(item.source);
    if (!response.ok) throw new Error(`${response.status}`);
    const markdown = await response.text();

    return {
      ...item,
      markdown,
      markdownHtml: markdownToHtml(markdown),
      markdownText: markdownToText(markdown),
    };
  } catch (error) {
    return {
      ...item,
      markdown: "",
      markdownHtml: `<p>Markdown 正文加载失败：${escapeHtml(error.message)}</p>`,
      markdownText: "",
    };
  }
};

const hydrateItems = async (items) => Promise.all(items.map(loadMarkdownSource));

const renderMarkdownDetails = (item) => {
  if (!item.markdownHtml) return null;

  const details = document.createElement("details");
  details.className = "card-details markdown-details";

  const summary = document.createElement("summary");
  summary.textContent = "查看 Markdown 正文";

  const body = document.createElement("div");
  body.className = "markdown-body";
  body.innerHTML = item.markdownHtml;

  details.append(summary, body);
  return details;
};

const renderCard = (item) => {
  const node = dom.cardTemplate.content.firstElementChild.cloneNode(true);
  const meta = node.querySelector(".card-meta");
  const title = node.querySelector("h3");
  const summary = node.querySelector("p");
  const tags = node.querySelector(".card-tags");
  const link = node.querySelector(".card-link");

  meta.textContent = formatMeta(item).join(" · ");
  title.textContent = item.title;
  summary.textContent = item.summary;
  tags.replaceChildren(
    ...(item.tags ?? []).map((tag) => {
      const chip = document.createElement("span");
      chip.textContent = tag;
      return chip;
    }),
  );

  const details = renderMarkdownDetails(item);
  if (details) node.insertBefore(details, tags);

  link.href = item.url || "#top";
  link.textContent = item.type === "file" ? "下载/查看" : "打开";

  return node;
};

const renderList = (target, items, emptyMessage) => {
  if (!items.length) {
    setEmpty(target, emptyMessage);
    return;
  }

  target.replaceChildren(...items.map(renderCard));
};

const getFilteredItems = () => {
  const query = normalize(state.query);

  return state.items.filter((item) => {
    const matchesType = state.type === "all" || item.type === state.type;
    const matchesTag = state.activeTag === "all" || (item.tags ?? []).includes(state.activeTag);
    const matchesQuery = !query || item.searchText.includes(query);

    return matchesType && matchesTag && matchesQuery;
  });
};

const renderResults = () => {
  const items = getFilteredItems();
  renderList(dom.results, items, "没有匹配内容。可以换个关键词、类型或标签。 ");
};

const renderTagCloud = () => {
  const tags = ["all", ...flattenTags(state.items)];
  const chips = tags.map((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tag-chip${state.activeTag === tag ? " active" : ""}`;
    button.textContent = tag === "all" ? "全部标签" : tag;
    button.addEventListener("click", () => {
      state.activeTag = tag;
      renderTagCloud();
      renderResults();
    });
    return button;
  });

  dom.tagCloud.replaceChildren(...chips);
};

const renderStaticSections = () => {
  renderList(dom.postList, state.items.filter((item) => item.type === "post"), "暂无博客文章。 ");
  renderList(dom.knowledgeList, state.items.filter((item) => item.type === "knowledge"), "暂无知识库条目。 ");
  renderList(dom.fileList, state.items.filter((item) => item.type === "file"), "暂无文件索引。 ");
};

const bindSearch = () => {
  dom.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderResults();
  });

  dom.typeFilter.addEventListener("change", (event) => {
    state.type = event.target.value;
    renderResults();
  });
};

const init = async () => {
  bindSearch();

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`内容数据加载失败：${response.status}`);

    state.data = await response.json();
    state.items = (await hydrateItems(toItems(state.data))).map((item) => ({
      ...item,
      searchText: toSearchText(item),
    }));

    renderTagCloud();
    renderStaticSections();
    renderResults();
  } catch (error) {
    setEmpty(dom.results, error.message);
    setEmpty(dom.postList, "内容数据加载失败。 ");
    setEmpty(dom.knowledgeList, "内容数据加载失败。 ");
    setEmpty(dom.fileList, "内容数据加载失败。 ");
  }
};

init();