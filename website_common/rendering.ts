import markdown from "markdown-it";
import attrs from "markdown-it-attrs";
import Prism from "prismjs";

const md = markdown({
    html: true,
    linkify: true,
    typographer: true,
    highlight(str, lang, attrs) {
        return syntaxHighlight(str, lang);
    },
})
    .use(attrs);

export function syntaxHighlight(string: string, lang: string): string {
    if (lang === "backolon") {
        // TODO: Backolon self-highlighting using an Unparser
        return string;
    }
    return Prism.highlight(string, Prism.languages[lang]!, lang);
}

export function renderMarkdown(string: string, mode: "block" | "inline") {
    return md[mode === "block" ? "render" : "renderInline"](string);
}
