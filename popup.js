const getTodayKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `_redditCleaner_${year}-${month}-${day}`;
};

const getTodayPosts = async () => {
  const key = getTodayKey();
  const result = await chrome.storage.local.get(key);
  return result[key] || {};
};

const getAllTimePosts = async () => {
  const allData = await chrome.storage.local.get(null);
  const allPosts = {};

  Object.keys(allData).forEach((key) => {
    if (
      key.startsWith("_redditCleaner_") &&
      key.match(/_redditCleaner_\d{4}-\d{2}-\d{2}/)
    ) {
      Object.assign(allPosts, allData[key]);
    }
  });

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

const updateStats = async () => {
  const todayContainer = document.getElementById("stats-today");
  const todayTotalEl = document.getElementById("today-total");
  const cleanedMsgEl = document.getElementById("cleaned-msg");
  const allTimeTotalEl = document.getElementById("alltime-total");
  const allTimeContainer = document.getElementById("stats-alltime");

  const todayPosts = await getTodayPosts();
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

  const allTimePosts = await getAllTimePosts();
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
    block: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
    eye: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`,
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
      <div style="display: flex; align-items: center; padding: 12px 0px; border-radius: 18px; background: transparent; border: 1px solid transparent;">
        <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 18px; flex-shrink: 0; color: ${textColor};">
          ${iconSvg}
        </div>
        <div style="flex: 1; min-width: 0;">
          <p style="font-size: 17px; font-weight: 500; color: #e5e7eb; margin: 0 0 2px 0;">${title}</p>
          <p style="font-size: 15px; color: #6b7280; margin: 0;">${subtitle}</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 15px; font-weight: 700; color: #9ca3af;">${percent}</span>
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
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
          <div style="width: 5px; height: 5px; border-radius: 50%; background: ${color};"></div>
          <span style="font-size: 14px; font-family: monospace; font-weight: 700; color: #d1d5db;">${percent}%</span>
        </div>
        <span style="font-size: 14px; color: #6b7280; font-weight: 500;">${prettyNumber(count)}</span>
      </div>
    `;
  };

  allTimeContainer.innerHTML =
    createAllTimeStat("#4ADE80", allTimeOkayPercent, allTimeOkay) +
    `<div style="width: 1px; height: 26px; background: rgba(255,255,255,0.05);"></div>` +
    createAllTimeStat("#EF4444", allTimeAdsPercent, allTimeAds) +
    `<div style="width: 1px; height: 26px; background: rgba(255,255,255,0.05);"></div>` +
    createAllTimeStat("#FBBF24", allTimeSuggestedPercent, allTimeSuggested);
};

updateStats();
