const STORAGE_KEY = "otomeReaderProfile";
const FONT_STORAGE_KEY = "otomeReaderFontSize";
const DEFAULT_PROFILE = { userName: "你", nickName: "宝宝" };
const DEFAULT_FONT_SIZE = 18;
const MIN_FONT_SIZE = 15;
const MAX_FONT_SIZE = 24;

// 直接双击打开 index.html 时，部分浏览器会限制读取本地 JSON。
// 这里保留一份示例数据作为 file:// 预览兜底；部署到 GitHub Pages 或本地服务器时仍优先读取 stories.json。
const FALLBACK_STORIES = [
  {
    id: "blue-hour-cafe",
    title: "蓝调时分的拿铁",
    maleLead: "周砚",
    summary: "雨停后的咖啡馆里，沉稳的店长把你常点的拿铁推到窗边。",
    tags: ["都市", "温柔", "日常"],
    status: "已完结",
    wordCount: "约 1.2k 字",
    content: [
      "雨线终于停在傍晚六点，玻璃窗外的街灯像被水洗过一样柔软。{{userName}}推开咖啡馆的门时，周砚已经抬头看了过来。",
      "他没有问你为什么来得比平时晚，只把一杯温热的拿铁放到窗边，杯壁上贴着一张小纸条：给{{nickName}}，今天也辛苦了。",
      "你坐下时，他轻声说：\"如果今天不想说话也没关系，我陪你把这场雨听完。\"",
    ],
  },
  {
    id: "library-moonlight",
    title: "图书馆月光预告",
    maleLead: "沈知澜",
    summary: "清冷学长在闭馆前替你留下一盏灯，也留下一句只对你说的晚安。",
    tags: ["校园", "清冷", "陪伴"],
    status: "已完结",
    wordCount: "约 900 字",
    content: [
      "闭馆音乐响起时，{{userName}}才发现窗外已经铺满月光。沈知澜站在书架尽头，手里拿着你找了一下午的那本书。",
      "\"下次可以直接问我。\"他的语气依旧平稳，却把书签夹在你停留过的章节，\"{{nickName}}，你不用每件事都自己慢慢找。\"",
      "离开图书馆前，他替你把围巾整理好。夜风很轻，你听见他说：\"明天见，我会给你占同一个位置。\"",
    ],
  },
  {
    id: "seaside-afterglow",
    title: "海边余晖来信",
    maleLead: "顾临川",
    summary: "旅行中的偶遇像一封没有寄出的信，他把海风和心意都交到你手里。",
    tags: ["旅行", "治愈", "重逢"],
    status: "连载中",
    wordCount: "约 1.5k 字",
    content: [
      "海浪把黄昏推到脚边时，顾临川递给{{userName}}一只白色贝壳，说里面藏着今天最漂亮的风声。",
      "你笑他幼稚，他却认真地看着你：\"{{nickName}}，我只是想让你把开心带回去，哪怕明天不在海边也能听见。\"",
      "远处灯塔亮起第一束光，他与你并肩往回走。那一刻，你忽然觉得重逢并不是巧合，而是某个人认真走向你的结果。",
    ],
  },
];

const state = {
  stories: [],
  activeTag: "全部",
  activeStoryId: null,
  fontSize: Number(localStorage.getItem(FONT_STORAGE_KEY)) || DEFAULT_FONT_SIZE,
};

const elements = {
  bookshelfView: document.querySelector("#bookshelf-view"),
  readerView: document.querySelector("#reader-view"),
  storyList: document.querySelector("#story-list"),
  tagFilters: document.querySelector("#tag-filters"),
  namePreview: document.querySelector("#name-preview"),
  nameModal: document.querySelector("#name-modal"),
  nameForm: document.querySelector("#name-form"),
  userNameInput: document.querySelector("#user-name"),
  nickNameInput: document.querySelector("#nick-name"),
  readerTitle: document.querySelector("#reader-title"),
  readerMeta: document.querySelector("#reader-meta"),
  readerTags: document.querySelector("#reader-tags"),
  readerSummary: document.querySelector("#reader-summary"),
  storyContent: document.querySelector("#story-content"),
};

/** 读取浏览器本地保存的姓名；没有填写时使用默认代入称呼。 */
function getProfile() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return { ...DEFAULT_PROFILE };
  }

  const parsed = JSON.parse(stored);
  return {
    userName: parsed.userName?.trim() || DEFAULT_PROFILE.userName,
    nickName: parsed.nickName?.trim() || DEFAULT_PROFILE.nickName,
  };
}

/** 将用户填写的姓名保存到 localStorage，不会上传或联网。 */
function saveProfile(profile) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      userName: profile.userName.trim(),
      nickName: profile.nickName.trim(),
    }),
  );
}

function updateNamePreview() {
  const profile = getProfile();
  elements.namePreview.textContent = `当前称呼：${profile.userName} / ${profile.nickName}`;
}

function openNameModal() {
  const profile = getProfile();
  elements.userNameInput.value = profile.userName === DEFAULT_PROFILE.userName ? "" : profile.userName;
  elements.nickNameInput.value = profile.nickName === DEFAULT_PROFILE.nickName ? "" : profile.nickName;
  elements.nameModal.showModal();
  elements.userNameInput.focus();
}

function closeNameModal() {
  elements.nameModal.close();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function replacePlaceholders(text) {
  const profile = getProfile();
  return String(text)
    .replaceAll("{{userName}}", profile.userName)
    .replaceAll("{{nickName}}", profile.nickName);
}

function getAllTags() {
  const tags = state.stories.flatMap((story) => story.tags || []);
  return ["全部", ...new Set(tags)];
}

function renderTagFilters() {
  elements.tagFilters.innerHTML = getAllTags()
    .map(
      (tag) => `
        <button
          class="filter-button ${tag === state.activeTag ? "active" : ""}"
          type="button"
          data-filter-tag="${escapeHtml(tag)}"
        >${escapeHtml(tag)}</button>
      `,
    )
    .join("");
}

function renderStoryCards() {
  const visibleStories = state.activeTag === "全部"
    ? state.stories
    : state.stories.filter((story) => story.tags.includes(state.activeTag));

  if (!visibleStories.length) {
    elements.storyList.innerHTML = `<p class="empty-state">这个标签下暂时还没有作品。</p>`;
    return;
  }

  elements.storyList.innerHTML = visibleStories
    .map(
      (story) => `
        <button class="story-card" type="button" data-story-id="${escapeHtml(story.id)}">
          <div class="tag-list">
            ${(story.tags || []).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}
          </div>
          <h3>${escapeHtml(story.title)}</h3>
          <p>${escapeHtml(story.summary)}</p>
          <div class="card-meta">
            <span class="pill">男主：${escapeHtml(story.maleLead)}</span>
            <span class="pill">${escapeHtml(story.wordCount)}</span>
            <span class="pill">${escapeHtml(story.status)}</span>
          </div>
        </button>
      `,
    )
    .join("");
}

function showBookshelf() {
  state.activeStoryId = null;
  elements.readerView.classList.add("hidden");
  elements.bookshelfView.classList.remove("hidden");
  history.replaceState(null, "", window.location.pathname);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showReader(storyId) {
  const story = state.stories.find((item) => item.id === storyId);

  if (!story) {
    showBookshelf();
    return;
  }

  state.activeStoryId = storyId;
  elements.bookshelfView.classList.add("hidden");
  elements.readerView.classList.remove("hidden");
  elements.readerTitle.textContent = story.title;
  elements.readerMeta.textContent = `男主：${story.maleLead} · ${story.wordCount} · ${story.status}`;
  elements.readerSummary.textContent = story.summary;
  elements.readerTags.innerHTML = (story.tags || []).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("");
  elements.storyContent.innerHTML = story.content
    .map((paragraph) => `<p>${escapeHtml(replacePlaceholders(paragraph))}</p>`)
    .join("");
  history.replaceState(null, "", `#story=${encodeURIComponent(story.id)}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function rerenderCurrentView() {
  updateNamePreview();

  if (state.activeStoryId) {
    showReader(state.activeStoryId);
  }
}

function applyFontSize() {
  document.documentElement.style.setProperty("--reader-font-size", `${state.fontSize}px`);
  localStorage.setItem(FONT_STORAGE_KEY, String(state.fontSize));
}

function changeFontSize(delta) {
  state.fontSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, state.fontSize + delta));
  applyFontSize();
}

function bindEvents() {
  document.querySelectorAll("[data-open-name-modal]").forEach((button) => {
    button.addEventListener("click", openNameModal);
  });

  document.querySelector("[data-close-name-modal]").addEventListener("click", closeNameModal);

  elements.nameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveProfile({
      userName: elements.userNameInput.value || DEFAULT_PROFILE.userName,
      nickName: elements.nickNameInput.value || DEFAULT_PROFILE.nickName,
    });
    closeNameModal();
    rerenderCurrentView();
  });

  elements.tagFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-tag]");

    if (!button) return;

    state.activeTag = button.dataset.filterTag;
    renderTagFilters();
    renderStoryCards();
  });

  elements.storyList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-story-id]");

    if (!card) return;

    showReader(card.dataset.storyId);
  });

  document.querySelector("[data-back-to-shelf]").addEventListener("click", showBookshelf);
  document.querySelector("[data-scroll-top]").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.querySelector("[data-font-decrease]").addEventListener("click", () => changeFontSize(-1));
  document.querySelector("[data-font-increase]").addEventListener("click", () => changeFontSize(1));
}

function readStoryIdFromHash() {
  const match = window.location.hash.match(/^#story=(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function init() {
  bindEvents();
  applyFontSize();
  updateNamePreview();

  try {
    const response = await fetch("stories.json");
    state.stories = await response.json();
  } catch (error) {
    console.warn("Using fallback stories because stories.json could not be loaded:", error);
    state.stories = FALLBACK_STORIES;
  }
  renderTagFilters();
  renderStoryCards();

  const initialStoryId = readStoryIdFromHash();
  if (initialStoryId) {
    showReader(initialStoryId);
  }

  if (!localStorage.getItem(STORAGE_KEY)) {
    openNameModal();
  }
}

init().catch((error) => {
  state.stories = FALLBACK_STORIES;
  renderTagFilters();
  renderStoryCards();
  console.error("Failed to initialize otome reader:", error);
});
