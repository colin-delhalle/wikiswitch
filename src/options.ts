import { EXTENSION_LANG_ORDER } from "./models/constant";
import type {
	LanguageDto,
	WikipediaLanguageApiResponse,
} from "./models/response";

const saveNewOrder = async () => {
	const newOrder = Array.from(document.querySelectorAll("li"))
		.map((li) => li.dataset.lang)
		.filter((lang) => lang !== undefined);
	browser.storage.sync.set({
		[EXTENSION_LANG_ORDER]: newOrder,
	});
};

(async () => {
	const addLanguageToList = (lang: LanguageDto) => {
		const newLi = document.createElement("li");
		newLi.textContent = lang.localname;
		newLi.title = lang.name;
		newLi.dataset.lang = lang.code;
		newLi.draggable = true;
		newLi.ondragend = dragEnd;
		newLi.ondragover = dragOver;
		newLi.ondragstart = dragStart;
		document.getElementById("languages")?.append(newLi);
	};

	const removeLanguageFromList = (langCode: string) => {
		const li = document
			.getElementById("languages")!
			.querySelector(`li[data-lang="${langCode}"]`);
		if (li) {
			document.getElementById("languages")?.removeChild(li);
		}
	};

	const onCheckboxChange = (e: Event) => {
		const checkbox = e.target as HTMLInputElement;
		if (checkbox.checked) {
			addLanguageToList({
				code: checkbox.id,
				name: checkbox.parentElement!.title,
				localname: checkbox.value,
			});
		} else {
			removeLanguageFromList(checkbox.id);
		}
		saveNewOrder();
	};

	let selected: Node | null = null;

	const dragOver = (e: DragEvent) => {
		if (!selected) {
			return;
		}

		const target = e.target as HTMLElement;
		if (isBefore(selected, target)) {
			target!.parentNode!.insertBefore(selected, target);
		} else {
			target!.parentNode!.insertBefore(selected, target.nextSibling);
		}
	};

	const dragEnd = () => {
		saveNewOrder();
		selected = null;
	};

	const dragStart = (e: DragEvent) => {
		selected = e.target as Node;
	};

	document.getElementById("languages")?.addEventListener("dragover", (e) => {
		e.preventDefault();
	});

	const isBefore = (el1: Node | null, el2: Node) => {
		if (el1 === null) {
			return false;
		}
		let cur: Node | null;
		if (el2.parentNode === el1.parentNode) {
			for (cur = el1.previousSibling; cur; cur = cur.previousSibling) {
				if (cur === el2) {
					return true;
				}
			}
		}
		return false;
	};

	document.getElementById("main")!.style.cursor = "wait";

	const culture = browser.i18n.getUILanguage().split("-")[0];
	const languagesUri = `https://${culture}.wikipedia.org/w/api.php?action=sitematrix&smtype=language&smsiteprop=lang|code&format=json&formatversion=2`;

	const response = await fetch(languagesUri);
	const body = (await response.json()) as WikipediaLanguageApiResponse;

	const languages = Object.values(body.sitematrix)
		// remove last items since it only contains the languages count
		.slice(0, -1)
		.filter((item) => item.site.some((s) => s.code === "wiki" && !s.closed))
		.map((item) => ({
			code: item.code,
			localName: item.localname,
			name: item.name,
		}));

	const userLangOrder =
		((await browser.storage.sync.get()) as Record<string, string[]>)[
			EXTENSION_LANG_ORDER
		] ?? [];

	document.getElementById("main")!.style.cursor = "default";

	for (const lang of userLangOrder) {
		const language = languages.find((l) => l.code === lang);
		if (language) {
			addLanguageToList({
				code: language.code,
				name: language.name,
				localname: language.localName,
			});
		}
	}

	for (const lang of languages) {
		const parentSpan = document.createElement("span");
		parentSpan.title = lang.localName;
		const label = document.createElement("label");
		label.textContent = lang.name;
		label.htmlFor = lang.code;
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = lang.code;
		checkbox.value = lang.name;
		checkbox.checked = userLangOrder.includes(lang.code);
		checkbox.onchange = onCheckboxChange;
		parentSpan.append(checkbox, label);
		document.getElementById("available-languages")?.append(parentSpan);
	}
})();
