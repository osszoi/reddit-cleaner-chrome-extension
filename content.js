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

const getAllTimePosts = () => {
  const allPosts = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key && key.startsWith("_redditCleaner_") && key.match(/_redditCleaner_\d{4}-\d{2}-\d{2}/)) {
      const dayPosts = JSON.parse(localStorage.getItem(key) || "{}");
      Object.assign(allPosts, dayPosts);
    }
  }

  return allPosts;
};

const prettyNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + "K";
  }
  return num.toString();
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
    min-width: 160px;
  `;

  panel.innerHTML = `
    <div style="font-size: 14px; font-weight: bold; color: #FF4500; margin-bottom: 10px;">
      Reddit Cleaner
    </div>
    <div id="reddit-cleaner-stats-content"></div>
  `;

  document.body.appendChild(panel);
};

const updateStats = () => {
  const content = document.getElementById("reddit-cleaner-stats-content");
  if (!content) return;

  const todayPosts = getTodayPosts();
  const todayClassifications = Object.values(todayPosts);

  const todayTotal = todayClassifications.length;
  const todayOkay = todayClassifications.filter((c) => c === "o").length;
  const todayAds = todayClassifications.filter((c) => c === "a").length;
  const todaySuggested = todayClassifications.filter((c) => c === "p").length;

  const todayOkayPercent = todayTotal > 0 ? ((todayOkay / todayTotal) * 100).toFixed(1) : 0;
  const todayAdsPercent = todayTotal > 0 ? ((todayAds / todayTotal) * 100).toFixed(1) : 0;
  const todaySuggestedPercent = todayTotal > 0 ? ((todaySuggested / todayTotal) * 100).toFixed(1) : 0;

  const allTimePosts = getAllTimePosts();
  const allTimeClassifications = Object.values(allTimePosts);

  const allTimeTotal = allTimeClassifications.length;
  const allTimeOkay = allTimeClassifications.filter((c) => c === "o").length;
  const allTimeAds = allTimeClassifications.filter((c) => c === "a").length;
  const allTimeSuggested = allTimeClassifications.filter((c) => c === "p").length;

  const allTimeOkayPercent = allTimeTotal > 0 ? ((allTimeOkay / allTimeTotal) * 100).toFixed(1) : 0;
  const allTimeAdsPercent = allTimeTotal > 0 ? ((allTimeAds / allTimeTotal) * 100).toFixed(1) : 0;
  const allTimeSuggestedPercent = allTimeTotal > 0 ? ((allTimeSuggested / allTimeTotal) * 100).toFixed(1) : 0;

  const createBar = (percent) => {
    const safePercent = Math.max(0, Math.min(100, parseFloat(percent) || 0));
    const filled = Math.round(safePercent / 10);
    const empty = Math.max(0, 10 - filled);
    return `${"█".repeat(filled)}${"░".repeat(empty)}`;
  };

  content.innerHTML = `
    <div style="font-size: 12px; font-weight: bold; color: #aaa; margin-bottom: 8px;">Today</div>
    <div style="margin-bottom: 6px; color: #ddd; font-size: 12px;">
      Total: <span style="color: #fff; font-weight: bold;">${todayTotal}</span>
    </div>
    <div style="margin-bottom: 6px; font-size: 11px;">
      <div style="color: #00ff00;">Okay: ${todayOkay} (${todayOkayPercent}%)</div>
      <div style="color: #00ff00; font-family: monospace; font-size: 10px;">${createBar(todayOkayPercent)}</div>
    </div>
    <div style="margin-bottom: 6px; font-size: 11px;">
      <div style="color: #ff0000;">Ads: ${todayAds} (${todayAdsPercent}%)</div>
      <div style="color: #ff0000; font-family: monospace; font-size: 10px;">${createBar(todayAdsPercent)}</div>
    </div>
    <div style="margin-bottom: 12px; font-size: 11px;">
      <div style="color: #ff9900;">Suggested: ${todaySuggested} (${todaySuggestedPercent}%)</div>
      <div style="color: #ff9900; font-family: monospace; font-size: 10px;">${createBar(todaySuggestedPercent)}</div>
    </div>

    <div style="border-top: 1px solid #444; margin: 12px 0;"></div>

    <div style="font-size: 12px; font-weight: bold; color: #aaa; margin-bottom: 8px;">All time</div>
    <div style="margin-bottom: 6px; color: #ddd; font-size: 12px;">
      Total: <span style="color: #fff; font-weight: bold;">${prettyNumber(allTimeTotal)}</span>
    </div>
    <div style="margin-bottom: 6px; font-size: 11px;">
      <div style="color: #00ff00;">Okay: ${prettyNumber(allTimeOkay)} (${allTimeOkayPercent}%)</div>
      <div style="color: #00ff00; font-family: monospace; font-size: 10px;">${createBar(allTimeOkayPercent)}</div>
    </div>
    <div style="margin-bottom: 6px; font-size: 11px;">
      <div style="color: #ff0000;">Ads: ${prettyNumber(allTimeAds)} (${allTimeAdsPercent}%)</div>
      <div style="color: #ff0000; font-family: monospace; font-size: 10px;">${createBar(allTimeAdsPercent)}</div>
    </div>
    <div style="font-size: 11px;">
      <div style="color: #ff9900;">Suggested: ${prettyNumber(allTimeSuggested)} (${allTimeSuggestedPercent}%)</div>
      <div style="color: #ff9900; font-family: monospace; font-size: 10px;">${createBar(allTimeSuggestedPercent)}</div>
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
  const allRegularPosts = Array.from(
    document.querySelectorAll("article:has(shreddit-post)")
  );

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
      const hasJoinButton = el.querySelector(
        "shreddit-post shreddit-join-button"
      );

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
