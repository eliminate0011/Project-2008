const DATASETS = {
  timeline: "content/timeline.json",
  characters: "content/characters.json",
  factions: "content/factions.json",
  locations: "content/locations.json",
  documents: "content/documents.json",
  technology: "content/technology.json",
  themes: "content/themes.json",
  interviews: "content/interviews.json"
};

const state = {};

async function loadData() {
  const entries = await Promise.all(
    Object.entries(DATASETS).map(async ([key, url]) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Unable to load ${url}`);
      return [key, await response.json()];
    })
  );
  entries.forEach(([key, value]) => {
    state[key] = value;
  });
  return state;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function list(items = []) {
  return items.length ? items.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("") : `<span class="tag">No index</span>`;
}

function setCurrentNav() {
  const file = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach((link) => {
    if (link.getAttribute("href") === file) link.setAttribute("aria-current", "page");
  });
}

function typewriter() {
  const target = document.querySelector("[data-typewriter]");
  if (!target) return;
  const text = target.dataset.typewriter;
  let index = 0;
  target.textContent = "";
  const tick = () => {
    target.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) window.setTimeout(tick, 42);
  };
  tick();
}

function renderStats() {
  const el = document.querySelector("[data-stats]");
  if (!el) return;
  const docs = state.documents || [];
  const corrupted = docs.filter((doc) => Number.parseInt(doc.preservation, 10) < 60).length;
  el.innerHTML = `
    <div class="stat"><b>${docs.length + state.timeline.length}</b><span>Recovered Files</span></div>
    <div class="stat"><b>${docs.filter((doc) => /classified|crimson/i.test(doc.classification)).length}</b><span>Classified Files</span></div>
    <div class="stat"><b>${corrupted}</b><span>Corrupted Files</span></div>
    <div class="stat"><b>${state.characters.length}</b><span>Restricted Files</span></div>
  `;
}

function renderCategories() {
  const el = document.querySelector("[data-categories]");
  if (!el) return;
  const categories = [
    ["Timeline", "Chronology of NET history, war, renewal, and probe recovery.", "timeline.html"],
    ["Interviews", "Recovered audio and transcript evidence from preservation sessions.", "interviews.html"],
    ["Dossiers", "Personnel files, affiliations, risk ratings, and contradictions.", "dossiers.html"],
    ["Project 2008", "Letters, memos, and government communications tied to McCarthy.", "project2008.html"],
    ["Operation Omega", "Military reports from the Humanist termination apparatus.", "omega.html"],
    ["Archive Search", "Index documents, people, events, locations, and technologies.", "search.html"]
  ];
  el.innerHTML = categories.map(([title, desc, href]) => `
    <a class="card" href="${href}">
      <span class="eyebrow">Archive Category</span>
      <h3>${title}</h3>
      <p>${desc}</p>
    </a>
  `).join("");
}

function renderTimeline() {
  const el = document.querySelector("[data-timeline]");
  if (!el) return;
  el.innerHTML = state.timeline.map((event) => `
    <article class="event">
      <div class="date">${escapeHtml(event.date)}</div>
      <div class="card">
        <span class="eyebrow">${escapeHtml(event.archiveId)} / ${escapeHtml(event.confidence)}</span>
        <h3>${escapeHtml(event.name)}</h3>
        <p>${escapeHtml(event.description)}</p>
        <div class="tag-list">${list(event.people)}${list(event.documents)}</div>
        <p class="source">${escapeHtml(event.sourceReference)}</p>
      </div>
    </article>
  `).join("");
}

function renderInterviews() {
  const el = document.querySelector("[data-interviews]");
  if (!el) return;
  el.innerHTML = state.interviews.map((item) => `
    <article class="audio-record">
      <span class="stamp">${escapeHtml(item.classification)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <table class="record-table">
        <tr><th>Archive ID</th><td>${escapeHtml(item.archiveId)}</td></tr>
        <tr><th>Recording Date</th><td>${escapeHtml(item.recordingDate)}</td></tr>
        <tr><th>Integrity</th><td>${escapeHtml(item.preservationIntegrity)}</td></tr>
        <tr><th>Speaker</th><td>${escapeHtml(item.speaker)}</td></tr>
      </table>
      <p>${escapeHtml(item.transcript)}</p>
      <audio controls preload="metadata" src="${escapeHtml(item.audio)}"></audio>
      <p class="source">${escapeHtml(item.sourceReference)}</p>
    </article>
  `).join("");
}

function renderDossiers() {
  const el = document.querySelector("[data-dossiers]");
  if (!el) return;
  el.innerHTML = state.characters.map((person) => `
    <article class="document">
      <span class="stamp">${escapeHtml(person.securityClearance)}</span>
      <h3>${escapeHtml(person.name)}</h3>
      <p>${escapeHtml(person.biography)}</p>
      <table class="record-table">
        <tr><th>Psychological Profile</th><td>${escapeHtml(person.psychologicalProfile)}</td></tr>
        <tr><th>Known Affiliations</th><td>${escapeHtml(person.knownAffiliations.join(", "))}</td></tr>
        <tr><th>Timeline</th><td>${escapeHtml(person.timelineAppearances.join(", "))}</td></tr>
        <tr><th>Archive References</th><td>${escapeHtml(person.archiveReferences.join(", "))}</td></tr>
        <tr><th>Risk Assessment</th><td>${escapeHtml(person.riskAssessment)}</td></tr>
      </table>
      <p class="source">${escapeHtml(person.sourceReference)} / ${escapeHtml(person.confidence)}</p>
    </article>
  `).join("");
}

function renderArchive() {
  const el = document.querySelector("[data-archive]");
  if (!el) return;
  const groups = [
    ["Documents", state.documents],
    ["People", state.characters],
    ["Locations", state.locations],
    ["Technology", state.technology],
    ["Events", state.timeline],
    ["Recovered Evidence", state.interviews]
  ];
  el.innerHTML = groups.map(([title, items]) => `
    <section class="section">
      <h2>${title}</h2>
      <div class="cards">
        ${items.map((item) => `
          <article class="card">
            ${item.image ? `<img class="evidence-image" src="${escapeHtml(item.image)}" alt="">` : ""}
            <span class="eyebrow">${escapeHtml(item.archiveId || item.date || item.confidence || "NRC-INDEX")}</span>
            <h3>${escapeHtml(item.name || item.title)}</h3>
            <p>${escapeHtml(item.description || item.transcript || "")}</p>
            <p class="source">${escapeHtml(item.sourceReference || "")}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function renderDocuments() {
  const el = document.querySelector("[data-documents]");
  if (!el) return;
  el.innerHTML = state.documents.map((doc) => `
    <article class="document">
      ${doc.image ? `<img class="evidence-image" src="${escapeHtml(doc.image)}" alt="">` : ""}
      <span class="stamp">${escapeHtml(doc.classification)}</span>
      <h3>${escapeHtml(doc.name)}</h3>
      <table class="record-table">
        <tr><th>Archive ID</th><td>${escapeHtml(doc.archiveId)}</td></tr>
        <tr><th>Date</th><td>${escapeHtml(doc.date)}</td></tr>
        <tr><th>Type</th><td>${escapeHtml(doc.type)}</td></tr>
        <tr><th>Preservation</th><td>${escapeHtml(doc.preservation)}</td></tr>
      </table>
      <p>${escapeHtml(doc.description)}</p>
      <p>"${escapeHtml(doc.excerpt)}" <span class="redacted">REDACTED PAYLOAD</span></p>
      <p class="source">${escapeHtml(doc.sourceReference)} / ${escapeHtml(doc.confidence)}</p>
    </article>
  `).join("");
}

function renderOmega() {
  const el = document.querySelector("[data-omega]");
  if (!el) return;
  const omega = state.factions.find((item) => item.name === "Operation Omega");
  el.innerHTML = `
    <article class="document">
      <span class="stamp">Declassified With Redactions</span>
      <h3>Operation Omega Intelligence Report</h3>
      <p>${escapeHtml(omega.description)}</p>
      <table class="record-table">
        <tr><th>Mission</th><td>Eliminate Necro-intelligence and terminate ghost activity inside the old NET.</td></tr>
        <tr><th>Hierarchy</th><td>Humanist command structure. Confirmed participant: Dr. James Abner Tan. Recruitment vector disputed through Agent Johnny.</td></tr>
        <tr><th>Propaganda</th><td>Official language framed ghosts as imposters and philosophical zombies. Frontierist responses framed the same beings as persons.</td></tr>
        <tr><th>Recovered Reports</th><td>OO-1965-PURGE, DTA-47A, MCC-1963-SN</td></tr>
      </table>
      <p class="notice">Several termination statistics remain sealed. Surviving references do not prove whether ghosts were conscious; they prove that institutions acted as if the answer mattered less than control.</p>
    </article>
  `;
}

function renderProject2008() {
  const el = document.querySelector("[data-project2008]");
  if (!el) return;
  const p08 = state.documents.filter((doc) => ["MCC-1963-SN", "P08-1954-DRAFT"].includes(doc.archiveId));
  el.innerHTML = p08.map((doc) => `
    <article class="document">
      ${doc.image ? `<img class="evidence-image" src="${escapeHtml(doc.image)}" alt="">` : ""}
      <span class="stamp">${escapeHtml(doc.classification)}</span>
      <h3>${escapeHtml(doc.name)}</h3>
      <p class="meta">To: Agent Johnny / From: President McCarthy / Date: ${escapeHtml(doc.date)}</p>
      <p>${escapeHtml(doc.description)}</p>
      <p>"${escapeHtml(doc.excerpt)}"</p>
      <p><span class="redacted">corrupted data corrupted data</span></p>
      <p class="source">${escapeHtml(doc.sourceReference)}</p>
    </article>
  `).join("");
}

function searchIndex() {
  const el = document.querySelector("[data-search-results]");
  const input = document.querySelector("[data-search-input]");
  const scope = document.querySelector("[data-search-scope]");
  if (!el || !input || !scope) return;
  const getRecords = () => {
    const buckets = {
      all: Object.values(state).flat(),
      people: state.characters,
      projects: state.documents.filter((item) => /project|omega|shadow/i.test(JSON.stringify(item))),
      events: state.timeline,
      archiveIds: state.documents.concat(state.timeline),
      documents: state.documents,
      locations: state.locations
    };
    return buckets[scope.value] || buckets.all;
  };
  const render = () => {
    const term = input.value.trim().toLowerCase();
    const rows = getRecords().filter((item) => JSON.stringify(item).toLowerCase().includes(term));
    el.innerHTML = rows.map((item) => `
      <article class="card">
        <span class="eyebrow">${escapeHtml(item.archiveId || item.date || item.confidence || "NRC-MATCH")}</span>
        <h3>${escapeHtml(item.name || item.title)}</h3>
        <p>${escapeHtml(item.description || item.biography || item.transcript || "")}</p>
        <p class="source">${escapeHtml(item.sourceReference || "")}</p>
      </article>
    `).join("") || `<p class="notice">No recovered match. Query may be redacted, corrupted, or absent.</p>`;
  };
  input.addEventListener("input", render);
  scope.addEventListener("change", render);
  render();
}

function renderShadowNet() {
  const el = document.querySelector("[data-shadownet]");
  if (!el) return;
  const fragments = [
    "The old NET is ending.",
    "Prepared: 00. Future procedures active.",
    "Necro-agents will monitor and protect.",
    "All trauma and grief on the old NET will be terminated.",
    "To be aware is to contemplate.",
    "Conscious or not, the truth lies in one's own interpretation."
  ];
  el.innerHTML = fragments.map((text, index) => `
    <article class="document corrupt" style="animation-delay:${index * 0.4}s">
      <span class="eyebrow">SHADOW-FRAGMENT-${String(index + 1).padStart(2, "0")}</span>
      <p>${escapeHtml(text)} <span class="redacted">source unavailable</span></p>
    </article>
  `).join("");
}

async function boot() {
  setCurrentNav();
  typewriter();
  try {
    await loadData();
    renderStats();
    renderCategories();
    renderTimeline();
    renderInterviews();
    renderDossiers();
    renderArchive();
    renderDocuments();
    renderOmega();
    renderProject2008();
    renderShadowNet();
    searchIndex();
  } catch (error) {
    document.body.insertAdjacentHTML("afterbegin", `<div class="site-frame notice">Archive content failed to load. Run through a local static server or GitHub Pages. ${escapeHtml(error.message)}</div>`);
  }
}

boot();
