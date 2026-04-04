const state = {
  data: null,
};

function byId(id) {
  return document.getElementById(id);
}

function setStatus(text, isError = false) {
  const status = byId("status");
  status.textContent = text;
  status.style.color = isError ? "#b00020" : "var(--muted)";
}

function lineArrayToText(lines) {
  return (lines || []).join("\n");
}

function textToLineArray(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function createItemEditor({ type, item = {} }) {
  const wrap = document.createElement("div");
  wrap.className = "item";

  if (type === "project") {
    wrap.innerHTML = `
      <div class="form-row">
        <label class="field">名称<input data-key="name" value="${item.name || ""}" /></label>
        <label class="field">年份<input data-key="year" value="${item.year || ""}" /></label>
      </div>
      <label class="field">描述<textarea data-key="description">${item.description || ""}</textarea></label>
      <div class="form-row">
        <label class="field">链接<input data-key="link" value="${item.link || ""}" /></label>
        <label class="field">标签（逗号分隔）<input data-key="tags" value="${(item.tags || []).join(", ")}" /></label>
      </div>
      <button type="button" data-delete="1">删除</button>
    `;
  }

  if (type === "timeline") {
    wrap.innerHTML = `
      <div class="form-row">
        <label class="field">时间段<input data-key="period" value="${item.period || ""}" /></label>
        <label class="field">组织<input data-key="org" value="${item.org || ""}" /></label>
      </div>
      <label class="field">标题<input data-key="title" value="${item.title || ""}" /></label>
      <label class="field">描述<textarea data-key="description">${item.description || ""}</textarea></label>
      <button type="button" data-delete="1">删除</button>
    `;
  }

  if (type === "writing") {
    wrap.innerHTML = `
      <label class="field">标题<input data-key="title" value="${item.title || ""}" /></label>
      <label class="field">摘要<textarea data-key="summary">${item.summary || ""}</textarea></label>
      <div class="form-row">
        <label class="field">slug（站内文章标识）<input data-key="slug" value="${item.slug || ""}" /></label>
        <label class="field">链接 URL（可选）<input data-key="url" value="${item.url || ""}" /></label>
      </div>
      <label class="field">正文内容（站内文章可选）<textarea data-key="content">${item.content || ""}</textarea></label>
      <button type="button" data-delete="1">删除</button>
    `;
  }

  if (type === "social") {
    wrap.innerHTML = `
      <div class="form-row">
        <label class="field">名称<input data-key="label" value="${item.label || ""}" /></label>
        <label class="field">链接<input data-key="url" value="${item.url || ""}" /></label>
      </div>
      <button type="button" data-delete="1">删除</button>
    `;
  }

  wrap.querySelector("[data-delete]").addEventListener("click", () => {
    wrap.remove();
    refreshPreview();
  });

  wrap.addEventListener("input", refreshPreview);
  return wrap;
}

function renderArrayEditors() {
  const projects = byId("projects");
  const timeline = byId("timeline");
  const writing = byId("writing");
  const socials = byId("socials");
  projects.innerHTML = "";
  timeline.innerHTML = "";
  writing.innerHTML = "";
  socials.innerHTML = "";

  (state.data.projects || []).forEach((item) => projects.appendChild(createItemEditor({ type: "project", item })));
  (state.data.timeline || []).forEach((item) => timeline.appendChild(createItemEditor({ type: "timeline", item })));
  (state.data.writing || []).forEach((item) => writing.appendChild(createItemEditor({ type: "writing", item })));
  (state.data.profile?.socials || []).forEach((item) => socials.appendChild(createItemEditor({ type: "social", item })));
}

function fillForm() {
  const profile = state.data.profile || {};
  const resume = state.data.resume || {};
  byId("name").value = profile.name || "";
  byId("title").value = profile.title || "";
  byId("tagline").value = profile.tagline || "";
  byId("intro").value = profile.intro || "";
  byId("location").value = profile.location || "";
  byId("email").value = profile.email || "";
  byId("githubUsername").value = profile.githubUsername || "";
  byId("resumeFileUrl").value = resume.fileUrl || "";
  byId("aboutLines").value = lineArrayToText(state.data.about || []);
  byId("nowLines").value = (state.data.now || []).map((i) => `${i.label || ""}|${i.value || ""}`).join("\n");
  byId("resumeSummary").value = resume.summary || "";
  byId("resumeSkills").value = lineArrayToText(resume.skills || []);
  byId("resumeHighlights").value = lineArrayToText(resume.highlights || []);
  renderArrayEditors();
  refreshPreview();
}

function readEditors(containerId, type) {
  const container = byId(containerId);
  const items = [];
  container.querySelectorAll(".item").forEach((row) => {
    const values = {};
    row.querySelectorAll("[data-key]").forEach((field) => {
      values[field.dataset.key] = field.value.trim();
    });

    if (type === "project") {
      values.tags = values.tags ? values.tags.split(",").map((x) => x.trim()).filter(Boolean) : [];
    }

    items.push(values);
  });
  return items;
}

function collectData() {
  const socialItems = readEditors("socials", "social").filter((item) => item.label || item.url);
  const next = {
    profile: {
      name: byId("name").value.trim(),
      title: byId("title").value.trim(),
      tagline: byId("tagline").value.trim(),
      intro: byId("intro").value.trim(),
      location: byId("location").value.trim(),
      email: byId("email").value.trim(),
      githubUsername: byId("githubUsername").value.trim(),
      socials: socialItems,
    },
    resume: {
      summary: byId("resumeSummary").value.trim(),
      skills: textToLineArray(byId("resumeSkills").value),
      highlights: textToLineArray(byId("resumeHighlights").value),
      fileUrl: byId("resumeFileUrl").value.trim(),
    },
    about: textToLineArray(byId("aboutLines").value),
    projects: readEditors("projects", "project"),
    timeline: readEditors("timeline", "timeline"),
    writing: readEditors("writing", "writing"),
    now: textToLineArray(byId("nowLines").value).map((line) => {
      const [label, ...rest] = line.split("|");
      return {
        label: (label || "").trim(),
        value: rest.join("|").trim(),
      };
    }),
  };
  state.data = next;
  return next;
}

function refreshPreview() {
  const next = collectData();
  byId("preview").textContent = JSON.stringify(next, null, 2);
}

function addItem(type) {
  const map = {
    project: "projects",
    timeline: "timeline",
    writing: "writing",
    social: "socials",
  };
  const container = byId(map[type]);
  container.appendChild(createItemEditor({ type, item: {} }));
  refreshPreview();
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(collectData(), null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "site.json";
  a.click();
  URL.revokeObjectURL(url);
  setStatus("已下载 site.json，请覆盖仓库 content/site.json 后提交。", false);
}

async function publishToGithub() {
  const owner = byId("ghOwner").value.trim();
  const repo = byId("ghRepo").value.trim();
  const branch = byId("ghBranch").value.trim() || "main";
  const token = byId("ghToken").value.trim();

  if (!owner || !repo || !token) {
    setStatus("请先填写 Owner、Repo 和 Token。", true);
    return;
  }

  const path = "content/site.json";
  const bodyText = JSON.stringify(collectData(), null, 2) + "\n";
  const content = btoa(unescape(encodeURIComponent(bodyText)));

  try {
    setStatus("正在读取远端文件版本...", false);
    const getResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    let sha = undefined;
    if (getResp.ok) {
      const fileInfo = await getResp.json();
      sha = fileInfo.sha;
    }

    setStatus("正在提交到 GitHub...", false);
    const putResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "chore: update homepage content via admin editor",
        content,
        branch,
        sha,
      }),
    });

    if (!putResp.ok) {
      const text = await putResp.text();
      throw new Error(text);
    }

    setStatus("发布成功。GitHub Pages 通常在几十秒内更新。", false);
  } catch (error) {
    setStatus(`发布失败：${String(error)}`, true);
  }
}

async function loadData() {
  try {
    const resp = await fetch("content/site.json?ts=" + Date.now());
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    state.data = await resp.json();
    fillForm();
    setStatus("已加载 content/site.json", false);
  } catch (error) {
    setStatus(`加载失败：${String(error)}`, true);
  }
}

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) {
    refreshPreview();
  }
});

byId("addProject").addEventListener("click", () => addItem("project"));
byId("addTimeline").addEventListener("click", () => addItem("timeline"));
byId("addWriting").addEventListener("click", () => addItem("writing"));
byId("addSocial").addEventListener("click", () => addItem("social"));
byId("reload").addEventListener("click", loadData);
byId("download").addEventListener("click", downloadJson);
byId("publish").addEventListener("click", publishToGithub);

loadData();
