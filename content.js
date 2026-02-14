// =============== STORAGE ===============
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

const saveTodayPosts = async (posts) => {
  const key = getTodayKey();
  await chrome.storage.local.set({ [key]: posts });
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


// =============== MAIN ===============
const promotedLabels = [
  "Popular",
  "Based on your recent activity",
  "Suggested for you",
  "Suggested",
  "Because you've",
  "Top posts by",
];

const main = async () => {
  const todayPosts = await getTodayPosts();

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

  await saveTodayPosts(todayPosts);

  removePromotedPostsFromReddit();
  removePostsLabeledAs(promotedLabels);
};

// =============== MAIN LOOP ===============
if (window.location.hostname.includes("reddit.com")) {
  setInterval(main, 500);
}
