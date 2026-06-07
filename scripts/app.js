const DATA_URL = "/data/content.json";

const dom = {
  searchInput: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  tagCloud: document.querySelector("#tagCloud"),
  postList: document.querySelector("#postList"),
  cardTemplate: document.querySelector("#cardTemplate"),
};

const state = {
  items: [],
  query: "",
  type: "all",
  activeTag: "all",
};

const typeLabels = {
  post: "文章",
  knowledge: "笔记",
  file: "资料",
};

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const toItems = (data) => [
  ...(data.posts ?? []).map((item) => ({ ...item, type: "post" })),
  ...(data.knowledge ?? []).map((item) => ({ ...item, type: "knowledge" })),
  ...(data.files ?? []).map((item) => ({ ...item, type: "file" })),
].sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));

const toSearchText = (item) =>
  normalize([
    item.title,
    item.summary,
    item.content,
    item.category,
    item.kind,
    item.size,
    ...(item.tags ?? []),
  ].join(" "));

const flattenTags = (items) => [...new Set(items.flatMap((item) => item.tags ?? []))].sort((a, b) =>
  a.localeCompare(b, "zh-CN"),
);

const formatMeta = (item) => [item.date, item.category || typeLabels[item.type]].filter(Boolean).join(" | ");

const filteredItems = () => {
  const query = normalize(state.query);

  return state.items.filter((item) => {
    const matchesType = state.type === "all" || item.type === state.type;
    const matchesTag = state.activeTag === "all" || (item.tags ?? []).includes(state.activeTag);
    const matchesQuery = !query || item.searchText.includes(query);
    return matchesType && matchesTag && matchesQuery;
  });
};

const setEmpty = (message) => {
  dom.postList.innerHTML = `<div class="empty-state">${message}</div>`;
};

const renderCard = (item) => {
  const node = dom.cardTemplate.content.firstElementChild.cloneNode(true);
  const title = node.querySelector(".post-title");
  const meta = node.querySelector(".post-meta");
  const summary = node.querySelector("p");
  const tags = node.querySelector(".card-tags");
  const readMore = node.querySelector(".read-more");

  title.href = item.url;
  title.textContent = item.title;
  meta.textContent = formatMeta(item);
  summary.textContent = item.summary;
  readMore.href = item.url;
  readMore.textContent = item.type === "file" ? "打开资料" : "阅读全文";

  tags.replaceChildren(
    ...(item.tags ?? []).map((tag) => {
      const chip = document.createElement("a");
      chip.href = `/tags/#${encodeURIComponent(tag)}`;
      chip.textContent = `#${tag}`;
      return chip;
    }),
  );

  return node;
};

const renderResults = () => {
  const items = filteredItems();
  if (!items.length) {
    setEmpty("没有匹配内容。");
    return;
  }

  dom.postList.replaceChildren(...items.map(renderCard));
};

const renderTags = () => {
  const tags = ["all", ...flattenTags(state.items)];
  dom.tagCloud.replaceChildren(
    ...tags.map((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `tag-chip${state.activeTag === tag ? " active" : ""}`;
      button.textContent = tag === "all" ? "全部标签" : tag;
      button.addEventListener("click", () => {
        state.activeTag = tag;
        renderTags();
        renderResults();
      });
      return button;
    }),
  );
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
  if (!dom.searchInput || !dom.typeFilter || !dom.cardTemplate || !dom.postList) return;

  bindSearch();

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`内容数据加载失败：${response.status}`);
    const data = await response.json();
    state.items = toItems(data).map((item) => ({ ...item, searchText: toSearchText(item) }));
    renderTags();
    renderResults();
  } catch (error) {
    setEmpty(error.message);
  }
};

init();