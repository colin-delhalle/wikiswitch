import {
	createSubMenuForLanguage,
	parseLink,
	removeExistingLocalStorageItems,
	removeExistingSubMenus,
	sortAndFilter,
} from "./helpers";
import {
	EXTENSION_ID,
	EXTENSION_PREFIX,
	EXTENSION_SEPARATOR,
} from "./models/constant";
import type { WikipediaApiResponse } from "./models/response";

browser.runtime.onInstalled.addListener((details) => {
	if (details.reason === "install") {
		browser.runtime.openOptionsPage();
	}
});

browser.contextMenus.create(
	{
		id: EXTENSION_ID,
		contexts: ["link"],
		targetUrlPatterns: [
			"*://*.wikipedia.org/wiki/*",
			"*://www.google.com/url*",
		],
		title: "View in other languages",
	},
	() => void browser.runtime.lastError,
);

browser.contextMenus.onShown.addListener(async (info) => {
	try {
		const { lang, title } = parseLink(info.linkUrl);
		if (!lang || !title) {
			return;
		}
		removeExistingSubMenus(info.menuIds);
		const apiResponse = await fetch(
			`https://${lang}.wikipedia.org/w/api.php?action=parse&page=${title}&format=json&prop=langlinks`,
		);
		const data = (await apiResponse.json()) as WikipediaApiResponse;
		removeExistingLocalStorageItems();
		const userSelectedLangsInOrder = await sortAndFilter(data.parse.langlinks);
		for (const lang of userSelectedLangsInOrder) {
			createSubMenuForLanguage(lang);
		}
		browser.contextMenus.refresh();
	} catch (error) {
		console.error(error);
	}
});

browser.contextMenus.onClicked.addListener(async (info) => {
	if (!info.menuItemId.toString().startsWith(EXTENSION_PREFIX)) {
		return;
	}

	try {
		const lang = info.menuItemId.toString().split(EXTENSION_SEPARATOR)[1];
		const url = localStorage.getItem(`${EXTENSION_PREFIX}${lang}`);
		if (url) {
			browser.tabs.create({ url });
		}
	} catch (error) {
		console.error(error);
	}
});
