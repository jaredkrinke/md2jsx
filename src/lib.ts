import { marked } from "marked";

function escapeBraces(text: string): string {
    return text.replace(/([{}])/g, "{'$1'}");
}

function escapeTemplateLiteral(text: string): string {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/[$]/g, "\\$")
    ;
}

const renderer = new marked.Renderer();

// Escape braces
renderer.text = escapeBraces;
renderer.codespan = text => `<code>${escapeBraces(text)}</code>`;

// Escape code blocks to preserve whitespace
renderer.code = code => `<pre><code>{\`${escapeTemplateLiteral(code)}\`}</code></pre>\n`;

const markedOptionsDefault: marked.MarkedOptions = {
    renderer,
    xhtml: true,
};

export interface MarkdownToJSXOptions {
    template?: boolean;
}

export const defaultOptions: MarkdownToJSXOptions = {
    template: false,
};

const prefix = "// Auto-generated using md2jsx\n\n";

export function markdownToJSX(md: string, options?: MarkdownToJSXOptions): string {
    if (options?.template) {
        marked.setOptions(marked.getDefaults());
        marked.setOptions(markedOptionsDefault);
        marked.use({
            extensions: [
                {
                    name: "sub",
                    level: "inline",
                    start: (src) => src.match(/[{][{]/)?.index,
                    tokenizer: (src) => {
                        const rule = /^[{][{](.*?)[}][}]/;
                        const match = rule.exec(src);
                        if (match) {
                            return {
                                type: "sub",
                                raw: match[0],
                                subName: match[1],
                            };
                        }
                    },
                    renderer: (token) => `{context?.${token.subName}}`,
                },
            ],
        });
        return `${prefix}export default (context = null) => <>\n${marked.parse(md)}</>;\n`;
    } else {
        marked.setOptions(marked.getDefaults());
        marked.setOptions(markedOptionsDefault);
        return `${prefix}export default <>\n${marked.parse(md)}</>;\n`;
    }
}
