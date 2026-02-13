// =============== FUNCTIONS ===============
const removePromotedPostsFromReddit = () => {
  let removed = 0;

  document.querySelectorAll("shreddit-ad-post").forEach((el) => {
    removed++;
    el.remove();
  });

  document
    .querySelectorAll("shreddit-post shreddit-join-button")
    .forEach((el) => {
      removed++;
      el.remove();
    });

  return removed;
};

const removePostsLabeledAs = (labels = []) => {
  let removed = 0;

  labels.forEach((label) => {
    Array.from(document.querySelectorAll("article"))
      .filter((el) =>
        el.querySelector('span[slot="credit-bar"]').textContent.includes(label)
      )
      .forEach((el) => {
        removed++;
        el.remove();
      });
  });

  return removed;
};

// =============== MAIN ===============
const main = () => {
  const removedPromotedPosts = removePromotedPostsFromReddit();
  const removedPostsLabeledAs = removePostsLabeledAs([
    "Popular",
    "Based on your recent activity",
    "Suggested for you",
    "Suggested",
    // "Because you've shown interest in a similar community",
    // "Because you've shown interest in a similar post"
    "Because you've",
    "Top posts by",
  ]);

  localStorage.setItem(
    "removedPromotedPosts",
    parseInt(localStorage.getItem("removedPromotedPosts") || 0) +
      removedPromotedPosts +
      removedPostsLabeledAs
  );
};

// =============== MAIN LOOP ===============
setInterval(main, 500);
