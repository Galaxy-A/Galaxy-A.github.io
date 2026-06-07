const DATA_URL = "/data/content.json";

const state = {
  items: [],
  activeTag: "all",
  query: "",
  type: "all",
};

const dom = {
  searchInput: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  tagCloud: document.querySelector("#tagCloud"),
  postList: document.querySelector("#postList"),
  latestList: document.querySelector("#latestList"),
  categoryList: document.querySelector("#categoryList"),
  sideTagList: document.querySelector("#sideTagList"),
  cardTemplate: document.querySelector("#cardTemplate"),
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

const countBy = (items, getKey) =>
  items.reduce((acc, item) => {
    const keys = getKey(item);
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      if (!key) continue;
      acc.set(key, (acc.get(key) ?? 0) + 1);
    }
    return acc;
  }, new Map());

const flattenTags = (items) => [...countBy(items, (item) => item.tags ?? []).keys()].sort((a, b) =>
  a.localeCompare(b, "zh-CN"),
);

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

const formatMeta = (item) => [item.date, item.category || typeLabels[item.type]].filter(Boolean).join(" | ");

const setEmpty = (target, message) => {
  target.innerHTML = `<div class="empty-state">${message}</div>`;
};

const renderPostCard = (item) => {
  const node = dom.cardTemplate.content.firstElementChild.cloneNode(true);
  const cover = node.querySelector(".post-cover");
  const title = node.querySelector(".post-title");
  const meta = node.querySelector(".post-meta");
  const summary = node.querySelector("p");
  const tags = node.querySelector(".card-tags");
  const readMore = node.querySelector(".read-more");

  cover.href = item.url;
  cover.style.backgroundImage = `url("${item.cover || "/assets/images/default.svg"}")`;
  title.href = item.url;
  title.textContent = item.title;
  meta.textContent = formatMeta(item);
  summary.textContent = item.summary;
  readMore.href = item.url;
  readMore.textContent = item.type === "file" ? "打开资料" : "阅读全文";

  tags.replaceChildren(
    ...(item.tags ?? []).map((tag) => {
      const chip = document.createElement("span");
      chip.textContent = tag;
      return chip;
    }),
  );

  return node;
};

const filteredItems = () => {
  const query = normalize(state.query);

  return state.items.filter((item) => {
    const matchesType = state.type === "all" || item.type === state.type;
    const matchesTag = state.activeTag === "all" || (item.tags ?? []).includes(state.activeTag);
    const matchesQuery = !query || item.searchText.includes(query);
    return matchesType && matchesTag && matchesQuery;
  });
};

const renderMainList = () => {
  const items = filteredItems();
  if (!items.length) {
    setEmpty(dom.postList, "没有匹配内容。可以换个关键词、类型或标签。");
    return;
  }

  dom.postList.replaceChildren(...items.map(renderPostCard));
};

const renderTagCloud = () => {
  const tags = ["all", ...flattenTags(state.items)];
  dom.tagCloud.replaceChildren(
    ...tags.map((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `tag-chip${state.activeTag === tag ? " active" : ""}`;
      button.textContent = tag === "all" ? "全部标签" : tag;
      button.addEventListener("click", () => {
        state.activeTag = tag;
        renderTagCloud();
        renderMainList();
      });
      return button;
    }),
  );
};

const renderLatest = () => {
  dom.latestList.replaceChildren(
    ...state.items.slice(0, 5).map((item) => {
      const link = document.createElement("a");
      link.href = item.url;
      link.className = "mini-post";
      link.innerHTML = `<span>${item.title}</span><small>${formatMeta(item)}</small>`;
      return link;
    }),
  );
};

const renderCategories = () => {
  const counts = [...countBy(state.items, (item) => item.category || typeLabels[item.type]).entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "zh-CN"),
  );

  dom.categoryList.replaceChildren(
    ...counts.map(([name, count]) => {
      const link = document.createElement("a");
      link.href = `/categories/#${encodeURIComponent(name)}`;
      link.innerHTML = `<span>${name}</span><strong>${count}</strong>`;
      return link;
    }),
  );
};

const renderSideTags = () => {
  const counts = [...countBy(state.items, (item) => item.tags ?? []).entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "zh-CN"),
  );

  dom.sideTagList.replaceChildren(
    ...counts.map(([name, count]) => {
      const link = document.createElement("a");
      link.href = `/tags/#${encodeURIComponent(name)}`;
      link.textContent = `${name} ${count}`;
      return link;
    }),
  );
};

const bindFilters = () => {
  dom.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderMainList();
  });

  dom.typeFilter.addEventListener("change", (event) => {
    state.type = event.target.value;
    renderMainList();
  });
};

const init = async () => {
  if (!dom.searchInput || !dom.typeFilter || !dom.cardTemplate) return;

  bindFilters();

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`内容数据加载失败：${response.status}`);

    const data = await response.json();
    state.items = toItems(data).map((item) => ({ ...item, searchText: toSearchText(item) }));

    renderTagCloud();
    renderMainList();
    renderLatest();
    renderCategories();
    renderSideTags();
  } catch (error) {
    setEmpty(dom.postList, error.message);
  }
};

init();