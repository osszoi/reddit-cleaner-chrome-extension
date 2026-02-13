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

    if (
      key &&
      key.startsWith("_redditCleaner_") &&
      key.match(/_redditCleaner_\d{4}-\d{2}-\d{2}/)
    ) {
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
    bottom: 10px;
    right: 10px;
    width: 270px;
    height: 435px;
    background: #121212;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 17px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    z-index: 9999;
    box-shadow: 0 12px 25px -6px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  const style = document.createElement("style");
  style.textContent = `
    #reddit-cleaner-stats-panel::-webkit-scrollbar { display: none; }
    #reddit-cleaner-stats-panel * { scrollbar-width: none; }
  `;
  document.head.appendChild(style);

  panel.innerHTML = `
    <div style="padding: 17px 17px 0 17px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 17px;">
        <div style="width: 29px; height: 29px; border-radius: 8px; background: #FF4500; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 7px rgba(255, 69, 0, 0.2);">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
            <path d="M19.36 2.72l1.42 1.42-5.72 5.71c1.07 1.54 1.22 3.39.32 4.59L9.06 8.12c1.2-.9 3.05-.75 4.59.32l5.71-5.72M5.93 17.57c-2.01-2.01-3.24-4.41-3.58-6.65l4.88-2.09 7.44 7.44-2.09 4.88c-2.24-.34-4.64-1.57-6.65-3.58z"/>
          </svg>
        </div>
        <h1 style="font-size: 14px; font-weight: 700; margin: 0; letter-spacing: -0.01em;">Reddit Cleaner</h1>
      </div>
    </div>

    <div style="flex: 1; padding: 0 17px; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px;">
        <h2 style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #6b7280; margin: 0;">Today's Activity</h2>
        <span id="reddit-cleaner-today-total" style="font-size: 9px; font-weight: 600; color: #9ca3af;">0 Actioned</span>
      </div>

      <div id="reddit-cleaner-stats-today" style="display: flex; flex-direction: column; gap: 3px;"></div>

      <div style="padding: 17px 6px;">
        <div style="height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);"></div>
        <p id="reddit-cleaner-cleaned-msg" style="text-align: center; font-size: 10px; color: rgba(255,255,255,0.2); margin: 12px 0 0 0; font-style: italic; font-weight: 300; letter-spacing: 0.05em;">Cleaned 0% of your feed today</p>
      </div>
    </div>

    <div style="padding: 23px 12px; background: #000000; border-top: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center;">
      <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 17px;">
        <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.3em; color: #4b5563; font-weight: 700; margin-bottom: 2px;">All Time</span>
        <span id="reddit-cleaner-alltime-total" style="font-size: 17px; font-family: monospace; font-weight: 700; letter-spacing: -0.02em;">0 Total</span>
      </div>
      <div id="reddit-cleaner-stats-alltime" style="display: flex; justify-content: center; width: 100%; max-width: 202px; gap: 0;"></div>
    </div>
  `;

  document.body.appendChild(panel);
};

const updateStats = () => {
  const todayContainer = document.getElementById("reddit-cleaner-stats-today");
  const todayTotalEl = document.getElementById("reddit-cleaner-today-total");
  const cleanedMsgEl = document.getElementById("reddit-cleaner-cleaned-msg");
  const allTimeTotalEl = document.getElementById(
    "reddit-cleaner-alltime-total"
  );
  const allTimeContainer = document.getElementById(
    "reddit-cleaner-stats-alltime"
  );

  if (!todayContainer || !allTimeContainer) return;

  const todayPosts = getTodayPosts();
  const todayClassifications = Object.values(todayPosts);

  const todayTotal = todayClassifications.length;
  const todayOkay = todayClassifications.filter((c) => c === "o").length;
  const todayAds = todayClassifications.filter((c) => c === "a").length;
  const todaySuggested = todayClassifications.filter((c) => c === "p").length;

  const todayOkayPercent =
    todayTotal > 0 ? ((todayOkay / todayTotal) * 100).toFixed(1) : 0;
  const todayAdsPercent =
    todayTotal > 0 ? ((todayAds / todayTotal) * 100).toFixed(1) : 0;
  const todaySuggestedPercent =
    todayTotal > 0 ? ((todaySuggested / todayTotal) * 100).toFixed(1) : 0;
  const todayCleanedPercent =
    todayTotal > 0
      ? (((todayAds + todaySuggested) / todayTotal) * 100).toFixed(0)
      : 0;

  const allTimePosts = getAllTimePosts();
  const allTimeClassifications = Object.values(allTimePosts);

  const allTimeTotal = allTimeClassifications.length;
  const allTimeOkay = allTimeClassifications.filter((c) => c === "o").length;
  const allTimeAds = allTimeClassifications.filter((c) => c === "a").length;
  const allTimeSuggested = allTimeClassifications.filter(
    (c) => c === "p"
  ).length;

  const allTimeOkayPercent =
    allTimeTotal > 0 ? ((allTimeOkay / allTimeTotal) * 100).toFixed(1) : 0;
  const allTimeAdsPercent =
    allTimeTotal > 0 ? ((allTimeAds / allTimeTotal) * 100).toFixed(1) : 0;
  const allTimeSuggestedPercent =
    allTimeTotal > 0 ? ((allTimeSuggested / allTimeTotal) * 100).toFixed(1) : 0;

  todayTotalEl.textContent = `${todayTotal} Actioned`;
  cleanedMsgEl.textContent = `Cleaned ${todayCleanedPercent}% of your feed today`;

  const icons = {
    block: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
    eye: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    check: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`,
  };

  const createStatCard = (
    iconSvg,
    bgColor,
    textColor,
    title,
    subtitle,
    percent
  ) => {
    return `
      <div style="display: flex; align-items: center; padding: 8px 0px; border-radius: 12px; background: transparent; border: 1px solid transparent;">
        <div style="width: 29px; height: 29px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; color: ${textColor};">
          ${iconSvg}
        </div>
        <div style="flex: 1; min-width: 0;">
          <p style="font-size: 11px; font-weight: 500; color: #e5e7eb; margin: 0 0 1px 0;">${title}</p>
          <p style="font-size: 10px; color: #6b7280; margin: 0;">${subtitle}</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; font-weight: 700; color: #9ca3af;">${percent}</span>
        </div>
      </div>
    `;
  };

  todayContainer.innerHTML =
    createStatCard(
      icons.block,
      "rgba(239, 68, 68, 0.1)",
      "#EF4444",
      `${todayAds} Ads blocked`,
      `Removed from feed`,
      `-${todayAdsPercent}%`
    ) +
    createStatCard(
      icons.eye,
      "rgba(251, 191, 36, 0.1)",
      "#FBBF24",
      `${todaySuggested} Suggested posts`,
      `Filtered suggestions`,
      `-${todaySuggestedPercent}%`
    ) +
    createStatCard(
      icons.check,
      "rgba(74, 222, 128, 0.1)",
      "#4ADE80",
      `${todayOkay} Okay Content`,
      `Quality content shown`,
      `+${todayOkayPercent}%`
    );

  allTimeTotalEl.textContent = `${prettyNumber(allTimeTotal)} Total`;

  const createAllTimeStat = (color, percent, count) => {
    return `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 1.5px;">
          <div style="width: 3px; height: 3px; border-radius: 50%; background: ${color};"></div>
          <span style="font-size: 9px; font-family: monospace; font-weight: 700; color: #d1d5db;">${percent}%</span>
        </div>
        <span style="font-size: 9px; color: #6b7280; font-weight: 500;">${prettyNumber(count)}</span>
      </div>
    `;
  };

  allTimeContainer.innerHTML =
    createAllTimeStat("#4ADE80", allTimeOkayPercent, allTimeOkay) +
    `<div style="width: 1px; height: 17px; background: rgba(255,255,255,0.05);"></div>` +
    createAllTimeStat("#EF4444", allTimeAdsPercent, allTimeAds) +
    `<div style="width: 1px; height: 17px; background: rgba(255,255,255,0.05);"></div>` +
    createAllTimeStat("#FBBF24", allTimeSuggestedPercent, allTimeSuggested);
};

if (window.location.hostname.includes("reddit.com")) {
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
}

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
if (window.location.hostname.includes("reddit.com")) {
  setInterval(main, 500);
}
