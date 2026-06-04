const DATA_URL = "data/content.json";
const AI_ENDPOINT_KEY = "galaxy-a-ai-endpoint";

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
  aiForm: document.querySelector("#aiForm"),
  aiEndpoint: document.querySelector("#aiEndpoint"),
  aiQuestion: document.querySelector("#aiQuestion"),
  aiAnswer: document.querySelector("#aiAnswer"),
};

const typeLabels = {
  post: "博客",
  knowledge: "知识库",
  file: "文件",
};

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const flattenTags = (items) =>
  [...new Set(items.flatMap((item) => item.tags ?? []))].sort((a, b) =>
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

const parseAiAnswer = async (response) => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await response.json();
    return data.answer ?? data.message ?? JSON.stringify(data, null, 2);
  }

  return response.text();
};

const setAiMessage = (message, isError = false) => {
  dom.aiAnswer.textContent = message;
  dom.aiAnswer.classList.toggle("error", isError);
};

const bindAiForm = () => {
  const savedEndpoint = localStorage.getItem(AI_ENDPOINT_KEY);
  if (savedEndpoint) dom.aiEndpoint.value = savedEndpoint;

  dom.aiForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const endpoint = dom.aiEndpoint.value.trim();
    const question = dom.aiQuestion.value.trim();

    if (!endpoint) {
      setAiMessage("请先填写 AI 代理接口 URL。", true);
      dom.aiEndpoint.focus();
      return;
    }

    if (!question) {
      setAiMessage("请先输入要发送给 AI 的问题。", true);
      dom.aiQuestion.focus();
      return;
    }

    localStorage.setItem(AI_ENDPOINT_KEY, endpoint);
    setAiMessage("正在请求 AI 代理接口……");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          context: state.data,
        }),
      });

      const answer = await parseAiAnswer(response);

      if (!response.ok) {
        throw new Error(answer || `请求失败：${response.status}`);
      }

      setAiMessage(answer || "AI 代理接口没有返回内容。 ");
    } catch (error) {
      setAiMessage(`AI 请求失败：${error.message}`, true);
    }
  });
};

const init = async () => {
  bindSearch();
  bindAiForm();

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`内容数据加载失败：${response.status}`);

    state.data = await response.json();
    state.items = toItems(state.data).map((item) => ({
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