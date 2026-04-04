function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function safeLink(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.href;
  } catch (_error) {
    return "#";
  }
}

function postUrl(itemData) {
  if (itemData.url) return safeLink(itemData.url);
  if (itemData.slug) return `post.html?slug=${encodeURIComponent(itemData.slug)}`;
  return "#";
}

function formatDate(dateText) {
  if (!dateText) return "";
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("zh-CN");
}

function renderGithubProjects(repos) {
  const wrap = document.getElementById("github-projects");
  wrap.innerHTML = "";

  if (!repos.length) {
    wrap.appendChild(createEl("p", "meta", "暂无公开仓库数据。"));
    return;
  }

  repos.forEach((repo) => {
    const item = createEl("article", "project");
    const title = createEl("h3", "", repo.name || "Untitled");
    const meta = createEl(
      "p",
      "github-meta",
      `★ ${repo.stargazers_count || 0} · ${repo.language || "Unknown"} · 更新于 ${formatDate(repo.pushed_at) || "--"}`
    );
    const desc = createEl("p", "", repo.description || "无项目描述");
    const link = document.createElement("a");
    link.href = safeLink(repo.html_url || "#");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "打开仓库";
    item.append(title, meta, desc, link);
    wrap.appendChild(item);
  });
}

async function loadGithubProjects(username) {
  const status = document.getElementById("github-status");
  if (!username) {
    status.textContent = "未设置 GitHub 用户名，暂不自动拉取。";
    renderGithubProjects([]);
    return;
  }

  try {
    status.textContent = `正在加载 @${username} 的公开项目...`;
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const repos = await response.json();
    const filtered = repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6);

    status.textContent = `展示 @${username} 的热门公开仓库（最多 6 个）。`;
    renderGithubProjects(filtered);
  } catch (error) {
    status.textContent = `GitHub 项目加载失败：${String(error)}`;
    renderGithubProjects([]);
  }
}

function renderSite(data) {
  const profile = data.profile || {};
  document.getElementById("name").textContent = profile.name || "Anonymous";
  document.getElementById("title").textContent = profile.title || "";
  document.getElementById("tagline").textContent = profile.tagline || "";
  document.getElementById("intro").textContent = profile.intro || "";
  document.getElementById("location").textContent = profile.location ? `Location: ${profile.location}` : "";
  document.getElementById("year").textContent = new Date().getFullYear();

  const socialsWrap = document.getElementById("socials");
  socialsWrap.innerHTML = "";
  (profile.socials || []).forEach((item) => {
    const a = document.createElement("a");
    a.href = safeLink(item.url || "#");
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = item.label || "Link";
    socialsWrap.appendChild(a);
  });

  const aboutWrap = document.getElementById("about");
  aboutWrap.innerHTML = "";
  (data.about || []).forEach((line) => {
    aboutWrap.appendChild(createEl("p", "", line));
  });

  const projectWrap = document.getElementById("projects");
  projectWrap.innerHTML = "";
  (data.projects || []).forEach((project) => {
    const item = createEl("article", "project");
    const title = createEl("h3", "", project.name || "Untitled");
    const meta = createEl("p", "subline", project.year || "");
    const desc = createEl("p", "", project.description || "");
    const link = document.createElement("a");
    link.href = safeLink(project.link || "#");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "打开项目";
    const tags = createEl("div", "tags");
    (project.tags || []).forEach((tag) => tags.appendChild(createEl("span", "tag", tag)));

    item.append(title, meta, desc, link, tags);
    projectWrap.appendChild(item);
  });

  const timelineWrap = document.getElementById("timeline");
  timelineWrap.innerHTML = "";
  (data.timeline || []).forEach((itemData) => {
    const item = createEl("article", "timeline-item");
    item.append(
      createEl("h3", "", itemData.title || "Untitled"),
      createEl("p", "subline", `${itemData.period || ""} · ${itemData.org || ""}`),
      createEl("p", "", itemData.description || "")
    );
    timelineWrap.appendChild(item);
  });

  const nowWrap = document.getElementById("now-list");
  nowWrap.innerHTML = "";
  (data.now || []).forEach((itemData) => {
    const item = createEl("div", "now-item");
    item.append(createEl("strong", "", itemData.label || ""), createEl("p", "", itemData.value || ""));
    nowWrap.appendChild(item);
  });

  const writingWrap = document.getElementById("writing");
  writingWrap.innerHTML = "";
  (data.writing || []).forEach((itemData) => {
    const item = createEl("article", "writing-item");
    const title = createEl("h3", "", itemData.title || "Untitled");
    const summary = createEl("p", "", itemData.summary || "");
    const link = document.createElement("a");
    link.href = postUrl(itemData);
    link.textContent = "阅读全文";
    if (itemData.url) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    item.append(title, summary, link);
    writingWrap.appendChild(item);
  });

  const resume = data.resume || {};
  document.getElementById("resume-summary").textContent = resume.summary || "";

  const skillWrap = document.getElementById("resume-skills");
  skillWrap.innerHTML = "";
  (resume.skills || []).forEach((skill) => {
    skillWrap.appendChild(createEl("span", "tag", skill));
  });

  const highlightWrap = document.getElementById("resume-highlights");
  highlightWrap.innerHTML = "";
  (resume.highlights || []).forEach((line) => {
    const item = createEl("article", "timeline-item");
    item.append(createEl("p", "", line));
    highlightWrap.appendChild(item);
  });

  const resumeFile = document.getElementById("resume-file");
  resumeFile.href = safeLink(resume.fileUrl || "#");
  resumeFile.style.display = resume.fileUrl ? "inline" : "none";

  loadGithubProjects(profile.githubUsername || "");
}

async function boot() {
  try {
    const response = await fetch("content/site.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    renderSite(data);
  } catch (error) {
    document.body.innerHTML = `<main style=\"padding:2rem;max-width:720px;margin:0 auto;\"><h1>页面加载失败</h1><p>无法读取 content/site.json，请检查文件是否存在且 JSON 格式正确。</p><pre>${String(
      error
    )}</pre></main>`;
  }
}

boot();
