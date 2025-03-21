import {
	EXTENSION_ID,
	EXTENSION_LANG_ORDER,
	EXTENSION_PREFIX,
	WIKIPEDIA_LINK_REGEX,
} from "./models/constant";
import type { LangLink } from "./models/response";

export const parseLink = (linkUrl?: string) => {
	if (!linkUrl) {
		return { lang: undefined, title: undefined };
	}

	const matches = linkUrl.match(WIKIPEDIA_LINK_REGEX);
	if (matches === null) {
		return { lang: undefined, title: undefined };
	}
	return { lang: matches[1], title: matches[2] };
};

export const createSubMenuForLanguage = (link: LangLink) => {
	browser.contextMenus.create(
		{
			id: `${EXTENSION_PREFIX}${link.lang}`,
			parentId: EXTENSION_ID,
			title: `${link["*"]} - ${link.langname}`,
		},
		() => void browser.runtime.lastError,
	);
	localStorage.setItem(`${EXTENSION_PREFIX}${link.lang}`, link.url);
};

export const removeExistingSubMenus = (menuIds: (string | number)[]) => {
	const wikiswitchMenuIds = menuIds.filter((id) =>
		id.toString().startsWith(EXTENSION_PREFIX),
	);
	for (const menuId of wikiswitchMenuIds) {
		browser.contextMenus.remove(menuId);
	}
};

export const removeExistingLocalStorageItems = () => {
	for (const key in localStorage) {
		if (key.startsWith(EXTENSION_PREFIX)) {
			localStorage.removeItem(key);
		}
	}
};

export const sortAndFilter = async (langLinks: LangLink[]) => {
	const userLangOrder =
		((await browser.storage.sync.get()) as Record<string, string[]>)[
			EXTENSION_LANG_ORDER
		] ?? [];

	const sortedAndFiltered = new Array<LangLink>(userLangOrder.length);
	for (let idx = 0; idx < userLangOrder.length; idx++) {
		const found = langLinks.find((link) => link.lang === userLangOrder[idx]);
		if (found) {
			sortedAndFiltered[idx] = found;
		}
	}
	return sortedAndFiltered.filter((link) => !!link);
};
