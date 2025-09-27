// =============== FUNCTIONS ===============
const removePromotedPostsFromReddit = () => {
	document.querySelectorAll('shreddit-ad-post').forEach((el) => el.remove());
};

const removePostsLabeledAs = (labels = []) => {
	labels.forEach((label) => {
		Array.from(document.querySelectorAll('article'))
			.filter((el) =>
				el.querySelector('span[slot="credit-bar"]').textContent.includes(label)
			)
			.forEach((el) => el.remove());
	});
};

// =============== MAIN ===============
const main = () => {
	removePromotedPostsFromReddit();
	removePostsLabeledAs([
		'Popular',
		'Based on your recent activity',
		'Suggested for you',
		'Suggested',
		// "Because you've shown interest in a similar community",
		// "Because you've shown interest in a similar post"
		"Because you've"
	]);
};

// =============== MAIN LOOP ===============
setInterval(main, 500);
