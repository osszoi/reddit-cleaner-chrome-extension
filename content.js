// =============== STORAGE ===============
const getTodayKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `_redditCleaner_${year}-${month}-${day}`;
};

const getTodayPosts = () => {
  const key = getTodayKey();
  return JSON.parse(localStorage.getItem(key) || "{}");
};

const saveTodayPosts = (posts) => {
  const key = getTodayKey();
  localStorage.setItem(key, JSON.stringify(posts));
};

// =============== FUNCTIONS ===============
const removePromotedPostsFromReddit = () => {
  document.querySelectorAll("shreddit-ad-post").forEach((el) => {
    el.remove();
  });
};

const removePostsLabeledAs = (labels = []) => {
  labels.forEach((label) => {
    Array.from(document.querySelectorAll("article"))
      .filter((el) =>
        el.querySelector('span[slot="credit-bar"]')?.textContent.includes(label)
      )
      .forEach((el) => {
        el.remove();
      });
  });

  document
    .querySelectorAll("article:has(shreddit-post shreddit-join-button)")
    .forEach((el) => {
      el.remove();
    });
};

// =============== STATS ===============
const createStatsPanel = () => {
  if (document.getElementById("reddit-cleaner-stats-panel")) return;

  const panel = document.createElement("div");
  panel.id = "reddit-cleaner-stats-panel";
  panel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(26, 26, 27, 0.95);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    min-width: 280px;
  `;

  panel.innerHTML = `
    <div style="font-size: 14px; font-weight: bold; color: #FF4500; margin-bottom: 10px;">
      🧹 Reddit Cleaner Stats
    </div>
    <div id="reddit-cleaner-stats-content"></div>
  `;

  document.body.appendChild(panel);
};

const updateStats = () => {
  const content = document.getElementById("reddit-cleaner-stats-content");
  if (!content) return;

  const todayPosts = getTodayPosts();
  const classifications = Object.values(todayPosts);

  const totalSeen = classifications.length;
  const okay = classifications.filter((c) => c === "o").length;
  const adsRemoved = classifications.filter((c) => c === "a").length;
  const suggestedRemoved = classifications.filter((c) => c === "p").length;

  const okayPercent = totalSeen > 0 ? ((okay / totalSeen) * 100).toFixed(1) : 0;
  const adsPercent = totalSeen > 0 ? ((adsRemoved / totalSeen) * 100).toFixed(1) : 0;
  const suggestedPercent = totalSeen > 0 ? ((suggestedRemoved / totalSeen) * 100).toFixed(1) : 0;

  const createBar = (percent) => {
    const safePercent = Math.max(0, Math.min(100, parseFloat(percent) || 0));
    const filled = Math.round(safePercent / 10);
    const empty = Math.max(0, 10 - filled);
    return `${"█".repeat(filled)}${"░".repeat(empty)}`;
  };

  content.innerHTML = `
    <div style="margin-bottom: 8px; color: #ddd;">
      Total posts: <span style="color: #fff; font-weight: bold;">${totalSeen}</span>
    </div>
    <div style="margin-bottom: 8px;">
      <div style="color: #00ff00;">Okay: ${okay} (${okayPercent}%)</div>
      <div style="color: #00ff00; font-family: monospace;">${createBar(okayPercent)}</div>
    </div>
    <div style="margin-bottom: 8px;">
      <div style="color: #ff0000;">Ads: ${adsRemoved} (${adsPercent}%)</div>
      <div style="color: #ff0000; font-family: monospace;">${createBar(adsPercent)}</div>
    </div>
    <div>
      <div style="color: #ff9900;">Suggested: ${suggestedRemoved} (${suggestedPercent}%)</div>
      <div style="color: #ff9900; font-family: monospace;">${createBar(suggestedPercent)}</div>
    </div>
  `;
};

if (document.body) {
  createStatsPanel();
  updateStats();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    createStatsPanel();
    updateStats();
  });
}

setInterval(updateStats, 1000);

// =============== MAIN ===============
const promotedLabels = [
  "Popular",
  "Based on your recent activity",
  "Suggested for you",
  "Suggested",
  "Because you've",
  "Top posts by",
];

const main = () => {
  const todayPosts = getTodayPosts();

  const allAdPosts = Array.from(document.querySelectorAll("shreddit-ad-post"));
  const allRegularPosts = Array.from(document.querySelectorAll("article:has(shreddit-post)"));

  allAdPosts.forEach((el) => {
    const id = el.id || el.getAttribute("data-post-id");
    if (id && !todayPosts[id]) {
      todayPosts[id] = "a";
    }
  });

  allRegularPosts.forEach((el) => {
    const id = el.id || el.getAttribute("data-post-id");
    if (id && !todayPosts[id]) {
      const creditBar = el.querySelector('span[slot="credit-bar"]');
      const hasJoinButton = el.querySelector("shreddit-post shreddit-join-button");

      if (creditBar) {
        const text = creditBar.textContent;
        const isPromoted = promotedLabels.some((label) => text.includes(label));
        todayPosts[id] = isPromoted ? "p" : "o";
      } else if (hasJoinButton) {
        todayPosts[id] = "p";
      } else {
        todayPosts[id] = "o";
      }
    }
  });

  saveTodayPosts(todayPosts);

  removePromotedPostsFromReddit();
  removePostsLabeledAs(promotedLabels);
};

// =============== MAIN LOOP ===============
setInterval(main, 500);
