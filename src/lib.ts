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

function parseFrontMatter(text: string, parseYaml: (str: string) => Record<string, any>): { metadata: Record<string, any>, markdown: string } {
    let metadata: Record<string, any> = {};
    let markdown = text;

    const frontMatterPattern = /^---\r?\n(.*?)\r?\n---(\r?\n|$)/ms;
    const matches = frontMatterPattern.exec(text);
    if (matches) {
        // Front matter found; parse it
        const frontMatter = matches[1];
        markdown = text.replace(matches[0], "");
        metadata = parseYaml(frontMatter);
    }

    return { metadata, markdown };
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
    parseFrontMatter?: (str: string) => Record<string, any>;
}

export const defaultOptions: MarkdownToJSXOptions = {
    template: false,
};

const prefix = "// Auto-generated using md2jsx\n\n";

export function basicYamlParser(yaml: string): Record<string, any> {
    const metadata: Record<string, any> = {};
    const frontMatterLinePattern = /^\s*(\w+)\s*:\s*(([^\[\]]+)|(\[(([^\[\]]+)*)\]))\s*$/;
    for (const line of yaml.split("\n")) {
        const lineMatches = frontMatterLinePattern.exec(line);
        if (!lineMatches) {
            throw new Error(`Invalid front matter line (${line.length}): ${line}`);
        }

        const [_entireLine, key, _entireValue, stringValue, _entireArray, arrayValue] = lineMatches;
        metadata[key.trim()] = stringValue ? stringValue.trim() : arrayValue.split(",").map(v => v.trim());
    }
    return metadata;
}

export function markdownToJSX(md: string, options?: MarkdownToJSXOptions): string {
    let markdown = md;
    let extra = "";

    if (options?.parseFrontMatter) {
        const result = parseFrontMatter(md, options.parseFrontMatter);
        markdown = result.markdown;
        extra = `\nexport const metadata = ${JSON.stringify(result.metadata, undefined, 4)};\n`;
    }

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
        return `${prefix}export default (context = null) => <>\n${marked.parse(markdown)}</>;\n${extra}`;
    } else {
        marked.setOptions(marked.getDefaults());
        marked.setOptions(markedOptionsDefault);
        return `${prefix}export default <>\n${marked.parse(markdown)}</>;\n${extra}`;
    }
}
