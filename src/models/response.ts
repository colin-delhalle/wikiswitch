export type LangLink = {
	lang: string;
	langname: string;
	autonym: string;
	"*": string;
	url: string;
};

export type WikipediaApiResponse = {
	parse: {
		langlinks: LangLink[];
	};
};

type Language = {
	code: string;
	name: string;
	localname: string;
	site: { code: string; closed?: boolean }[];
};

export type LanguageDto = {
	code: string;
	name: string;
	localname: string;
};

export type WikipediaLanguageApiResponse = {
	sitematrix: Record<string, Language>;
};
